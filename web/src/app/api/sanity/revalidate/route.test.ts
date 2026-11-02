import { describe, expect, it } from "vitest";

import { createRevalidateHandler, type WebhookParser } from "./route";

const request = () => new Request("https://rebvar.xyz/api/sanity/revalidate", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ _type: "portfolioProject" }),
});

const parser = (result: Awaited<ReturnType<WebhookParser>>): WebhookParser => async () => result;

describe("Sanity revalidation webhook", () => {
  it("rejects a missing signature", async () => {
    const handler = createRevalidateHandler(parser({ body: null, isValidSignature: null }), () => undefined, "secret");

    const response = await handler(request());

    expect(response.status).toBe(401);
  });

  it("rejects an invalid signature", async () => {
    const handler = createRevalidateHandler(parser({ body: null, isValidSignature: false }), () => undefined, "secret");

    const response = await handler(request());

    expect(response.status).toBe(401);
  });

  it("ignores signed events for unrelated document types", async () => {
    const invalidated: string[] = [];
    const handler = createRevalidateHandler(
      parser({ body: { _type: "newsArticle" }, isValidSignature: true }),
      (tag) => invalidated.push(tag),
      "secret",
    );

    const response = await handler(request());

    expect(response.status).toBe(202);
    expect(invalidated).toEqual([]);
  });

  it("invalidates portfolio caches for a valid signed event", async () => {
    const invalidated: string[] = [];
    const handler = createRevalidateHandler(
      parser({ body: { _type: "portfolioProject" }, isValidSignature: true }),
      (tag) => invalidated.push(tag),
      "secret",
    );

    const response = await handler(request());

    expect(response.status).toBe(200);
    expect(invalidated).toEqual(["portfolio"]);
  });
});

