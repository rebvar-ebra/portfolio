export const createFreshReadWindow = (durationMs: number) => {
  let bypassUntil = 0;

  return {
    mark(now = Date.now()) {
      bypassUntil = Math.max(bypassUntil, now + durationMs);
    },
    shouldBypass(now = Date.now()) {
      return now < bypassUntil;
    },
  };
};

export const portfolioFreshReadWindow = createFreshReadWindow(10_000);
