import { createHash } from "node:crypto";

import { Resend } from "resend";

import { buildContactEmail, parseContactSubmission } from "@/lib/contact";

const MAX_BODY_BYTES = 12_288;

type ContactConfig = {
  apiKey?: string;
  to?: string;
  from?: string;
  siteOrigin?: string;
};

export type ContactDelivery = {
  from: string;
  to: string;
  subject: string;
  replyTo: string;
  html: string;
  text: string;
  idempotencyKey: string;
};

export type ContactTransport = (delivery: ContactDelivery) => Promise<unknown>;
type RateLimiter = { allow(key: string): boolean };

export const createMemoryRateLimiter = ({
  maxRequests = 3,
  windowMs = 15 * 60_000,
  maxKeys = 1_000,
  now = Date.now,
}: {
  maxRequests?: number;
  windowMs?: number;
  maxKeys?: number;
  now?: () => number;
} = {}): RateLimiter => {
  const attempts = new Map<string, number[]>();

  return {
    allow(key) {
      const currentTime = now();
      const threshold = currentTime - windowMs;
      for (const [storedKey, timestamps] of attempts) {
        if (!timestamps.some((timestamp) => timestamp > threshold)) attempts.delete(storedKey);
      }
      if (!attempts.has(key) && attempts.size >= maxKeys) {
        const oldestKey = attempts.keys().next().value;
        if (oldestKey) attempts.delete(oldestKey);
      }
      const recent = (attempts.get(key) ?? []).filter((timestamp) => timestamp > threshold);
      if (recent.length >= maxRequests) return false;
      recent.push(currentTime);
      attempts.set(key, recent);
      return true;
    },
  };
};

const sharedLimiter = createMemoryRateLimiter();

const isLoopbackHost = (hostname: string) =>
  hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";

const isSameOrigin = (origin: string | null, siteOrigin: string | undefined, requestUrl: string) => {
  if (!origin) return false;
  try {
    const submittedOrigin = new URL(origin);
    const configuredOrigin = siteOrigin ? new URL(siteOrigin) : null;
    if (configuredOrigin && submittedOrigin.origin === configuredOrigin.origin) return true;

    const currentRequest = new URL(requestUrl);
    return isLoopbackHost(submittedOrigin.hostname)
      && submittedOrigin.origin === currentRequest.origin;
  } catch {
    return false;
  }
};

const limiterKey = (email: string) => createHash("sha256").update(email).digest("hex");

export const createContactHandler = ({
  transport,
  config,
  limiter = sharedLimiter,
}: {
  transport: ContactTransport;
  config: ContactConfig;
  limiter?: RateLimiter;
}) => async (request: Request) => {
  if (!isSameOrigin(request.headers.get("origin"), config.siteOrigin, request.url)) {
    return Response.json({ code: "forbidden" }, { status: 403 });
  }
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return Response.json({ code: "unsupported_media_type" }, { status: 415 });
  }

  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return Response.json({ code: "payload_too_large" }, { status: 413 });
  }
  if (!config.apiKey || !config.to || !config.from || !config.siteOrigin) {
    return Response.json({ code: "temporarily_unavailable" }, { status: 503 });
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return Response.json({ code: "invalid_submission" }, { status: 400 });
  }
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return Response.json({ code: "payload_too_large" }, { status: 413 });
  }

  let input: unknown;
  try {
    input = JSON.parse(rawBody);
  } catch {
    return Response.json({ code: "invalid_submission" }, { status: 400 });
  }

  const parsed = parseContactSubmission(input);
  if (!parsed.ok) {
    if (parsed.reason === "spam") return Response.json({ code: "sent" });
    return Response.json({ code: "invalid_submission" }, { status: 400 });
  }
  if (!limiter.allow(limiterKey(parsed.value.email))) {
    return Response.json({ code: "rate_limited" }, { status: 429 });
  }

  const email = buildContactEmail(parsed.value);
  try {
    await transport({
      ...email,
      from: config.from,
      to: config.to,
      idempotencyKey: `portfolio-contact/${parsed.value.submissionId}`,
    });
    return Response.json({ code: "sent" });
  } catch {
    return Response.json({ code: "delivery_failed" }, { status: 502 });
  }
};

const resendTransport = (apiKey: string): ContactTransport => async ({ idempotencyKey, ...delivery }) => {
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send(delivery, { idempotencyKey });
  if (error) throw new Error(error.name);
};

export const POST = (request: Request) => {
  const apiKey = process.env.RESEND_API_KEY;
  return createContactHandler({
    config: {
      apiKey,
      to: process.env.CONTACT_TO_EMAIL,
      from: process.env.CONTACT_FROM_EMAIL,
      siteOrigin: process.env.NEXT_PUBLIC_SITE_URL,
    },
    transport: resendTransport(apiKey ?? ""),
  })(request);
};
