import { describe, expect, it } from "vitest";

import { createFreshReadWindow, portfolioFreshReadWindow } from "./cache-state";

describe("Sanity fresh-read window", () => {
  it("bypasses the CDN briefly after a portfolio webhook", () => {
    const state = createFreshReadWindow(10_000);

    expect(state.shouldBypass(99)).toBe(false);
    state.mark(100);
    expect(state.shouldBypass(10_099)).toBe(true);
    expect(state.shouldBypass(10_100)).toBe(false);
  });

  it("shares the portfolio window through the process-wide symbol registry", () => {
    const key = Symbol.for("rebvar.portfolioFreshReadWindow");
    const processState = globalThis as typeof globalThis & Record<PropertyKey, unknown>;

    expect(processState[key]).toBe(portfolioFreshReadWindow);
  });
});
