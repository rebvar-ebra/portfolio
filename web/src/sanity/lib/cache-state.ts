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

type FreshReadWindow = ReturnType<typeof createFreshReadWindow>;

const isFreshReadWindow = (value: unknown): value is FreshReadWindow => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<FreshReadWindow>;
  return typeof candidate.mark === "function" && typeof candidate.shouldBypass === "function";
};

// Next.js can evaluate the webhook and page code in separate server chunks. Store
// the short-lived cache bypass on the process itself so both chunks share it.
const freshReadWindowKey = Symbol.for("rebvar.portfolioFreshReadWindow");
const processState = globalThis as typeof globalThis & Record<PropertyKey, unknown>;
const existingFreshReadWindow = processState[freshReadWindowKey];

export const portfolioFreshReadWindow = isFreshReadWindow(existingFreshReadWindow)
  ? existingFreshReadWindow
  : createFreshReadWindow(10_000);

processState[freshReadWindowKey] = portfolioFreshReadWindow;
