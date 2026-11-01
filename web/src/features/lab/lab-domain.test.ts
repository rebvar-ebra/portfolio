import { describe, expect, it } from "vitest";

import {
  calculateStats,
  filterOrders,
  getNextStatus,
  validateOrderDraft,
} from "./lab-domain";
import type { Order } from "./types";

const orders: Order[] = [
  { id: 1, item: "Wild mushroom risotto", quantity: 2, status: "new", createdAt: "2026-11-01T10:00:00Z", updatedAt: "2026-11-01T10:00:00Z" },
  { id: 2, item: "Roasted vegetable bowl", quantity: 1, status: "preparing", createdAt: "2026-11-01T10:01:00Z", updatedAt: "2026-11-01T10:02:00Z" },
  { id: 3, item: "Lemon herb pasta", quantity: 3, status: "ready", createdAt: "2026-11-01T10:03:00Z", updatedAt: "2026-11-01T10:05:00Z" },
];

describe("restaurant lab domain", () => {
  it("advances orders one stage and stops at ready", () => {
    expect(getNextStatus("new")).toBe("preparing");
    expect(getNextStatus("preparing")).toBe("ready");
    expect(getNextStatus("ready")).toBeNull();
  });

  it("filters without changing the source order list", () => {
    expect(filterOrders(orders, "preparing")).toEqual([orders[1]]);
    expect(filterOrders(orders, "all")).toEqual(orders);
    expect(orders).toHaveLength(3);
  });

  it("calculates dashboard totals from current orders", () => {
    expect(calculateStats(orders)).toEqual({ total: 3, new: 1, preparing: 1, ready: 1 });
  });

  it("validates the same public bounds as the API", () => {
    expect(validateOrderDraft({ item: "  Herb pasta  ", quantity: 2 })).toEqual({ valid: true, item: "Herb pasta", quantity: 2 });
    expect(validateOrderDraft({ item: " ", quantity: 2 })).toEqual({ valid: false, reason: "item" });
    expect(validateOrderDraft({ item: "Soup", quantity: 0 })).toEqual({ valid: false, reason: "quantity" });
    expect(validateOrderDraft({ item: "Soup", quantity: 21 })).toEqual({ valid: false, reason: "quantity" });
  });
});
