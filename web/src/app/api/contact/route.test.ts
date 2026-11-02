import { describe, expect, it, vi } from "vitest";

import { createContactHandler, createMemoryRateLimiter, type ContactTransport } from "./route";

const payload = (overrides: Record<string, unknown> = {}) => ({
  submissionId: "0f73c28e-93f6-4c71-858a-173fe340e2df",
  name: "Ada Lovelace",
  email: "ada@example.com",
  subject: "A useful web project",
  message: "I would like to discuss a full-stack project with you.",
  consent: true,
  website: "",
  ...overrides,
});

const config = {
  apiKey: "re_test",
  to: "private@example.com",
  from: "Portfolio <contact@rebvar.xyz>",
  siteOrigin: "https://rebvar.xyz",
};

const request = (options: {
  body?: string;
  origin?: string;
  contentType?: string;
  contentLength?: string;
  forwardedFor?: string;
} = {}) => new Request("https://rebvar.xyz/api/contact", {
  method: "POST",
  headers: {
    origin: options.origin ?? "https://rebvar.xyz",
    "content-type": options.contentType ?? "application/json",
    ...(options.contentLength ? { "content-length": options.contentLength } : {}),
    ...(options.forwardedFor ? { "x-forwarded-for": options.forwardedFor } : {}),
  },
  body: options.body ?? JSON.stringify(payload()),
});

const setup = (overrides: {
  transport?: ContactTransport;
  runtimeConfig?: Partial<typeof config>;
  maxRequests?: number;
} = {}) => {
  const transport = overrides.transport ?? vi.fn(async () => ({ id: "email-id" }));
  const handler = createContactHandler({
    transport,
    config: { ...config, ...overrides.runtimeConfig },
    limiter: createMemoryRateLimiter({ maxRequests: overrides.maxRequests ?? 3, windowMs: 60_000, now: () => 1_000 }),
  });
  return { handler, transport };
};

describe("POST /api/contact", () => {
  it("rejects a cross-origin request", async () => {
    const { handler, transport } = setup();
    expect((await handler(request({ origin: "https://evil.example" }))).status).toBe(403);
    expect(transport).not.toHaveBeenCalled();
  });

  it("requires application/json", async () => {
    const { handler, transport } = setup();
    expect((await handler(request({ contentType: "text/plain" }))).status).toBe(415);
    expect(transport).not.toHaveBeenCalled();
  });

  it("rejects declared and actual oversized bodies", async () => {
    const first = setup();
    expect((await first.handler(request({ contentLength: "13000" }))).status).toBe(413);

    const second = setup();
    expect((await second.handler(request({ body: JSON.stringify(payload({ message: "m".repeat(13_000) })) }))).status).toBe(413);
    expect(first.transport).not.toHaveBeenCalled();
    expect(second.transport).not.toHaveBeenCalled();
  });

  it("returns 503 when private delivery configuration is missing", async () => {
    const { handler, transport } = setup({ runtimeConfig: { apiKey: "" } });
    expect((await handler(request())).status).toBe(503);
    expect(transport).not.toHaveBeenCalled();
  });

  it("returns a generic 400 for invalid input", async () => {
    const { handler, transport } = setup();
    const response = await handler(request({ body: JSON.stringify(payload({ consent: false })) }));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ code: "invalid_submission" });
    expect(transport).not.toHaveBeenCalled();
  });

  it("silently accepts honeypot submissions without sending", async () => {
    const { handler, transport } = setup();
    const response = await handler(request({ body: JSON.stringify(payload({ website: "bot" })) }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ code: "sent" });
    expect(transport).not.toHaveBeenCalled();
  });

  it("rate-limits the same client and email hash", async () => {
    const { handler, transport } = setup({ maxRequests: 1 });
    expect((await handler(request({ forwardedFor: "203.0.113.10" }))).status).toBe(200);
    expect((await handler(request({ forwardedFor: "203.0.113.10" }))).status).toBe(429);
    expect(transport).toHaveBeenCalledTimes(1);
  });

  it("uses the client UUID as the provider idempotency key", async () => {
    const { handler, transport } = setup();
    expect((await handler(request())).status).toBe(200);
    expect(transport).toHaveBeenCalledWith(expect.objectContaining({
      idempotencyKey: "portfolio-contact/0f73c28e-93f6-4c71-858a-173fe340e2df",
      to: "private@example.com",
      from: "Portfolio <contact@rebvar.xyz>",
      replyTo: "ada@example.com",
    }));
  });

  it("maps provider failure to a retryable 502 without echoing details", async () => {
    const { handler } = setup({ transport: vi.fn(async () => { throw new Error("provider secret details"); }) });
    const response = await handler(request());
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ code: "delivery_failed" });
  });
});
