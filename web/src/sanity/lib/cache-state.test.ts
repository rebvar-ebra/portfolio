import { describe, expect, it } from "vitest";

import { createFreshReadWindow } from "./cache-state";

describe("Sanity fresh-read window", () => {
  it("bypasses the CDN briefly after a portfolio webhook", () => {
    const state = createFreshReadWindow(10_000);

    expect(state.shouldBypass(99)).toBe(false);
    state.mark(100);
    expect(state.shouldBypass(10_099)).toBe(true);
    expect(state.shouldBypass(10_100)).toBe(false);
  });
});
