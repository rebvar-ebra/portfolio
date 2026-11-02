import { describe, expect, it } from "vitest";

import nextConfig from "../../next.config";

describe("production response headers", () => {
  it("sets baseline browser security headers on every route", async () => {
    const entries = await nextConfig.headers?.();
    const globalHeaders = entries?.find((entry) => entry.source === "/:path*")?.headers ?? [];
    const headers = Object.fromEntries(globalHeaders.map(({ key, value }) => [key, value]));

    expect(headers).toMatchObject({
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    });
  });
});
