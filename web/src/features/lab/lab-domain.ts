import type {
  DashboardStats,
  Order,
  OrderDraft,
  OrderFilter,
  OrderStatus,
} from "./types";

export const getNextStatus = (status: OrderStatus): OrderStatus | null => {
  if (status === "new") return "preparing";
  if (status === "preparing") return "ready";
  return null;
};

export const filterOrders = (orders: readonly Order[], filter: OrderFilter): Order[] =>
  filter === "all" ? [...orders] : orders.filter((order) => order.status === filter);

export const calculateStats = (orders: readonly Order[]): DashboardStats =>
  orders.reduce<DashboardStats>(
    (stats, order) => ({
      ...stats,
      total: stats.total + 1,
      [order.status]: stats[order.status] + 1,
    }),
    { total: 0, new: 0, preparing: 0, ready: 0 },
  );

export const validateOrderDraft = (
  draft: OrderDraft,
):
  | { valid: true; item: string; quantity: number }
  | { valid: false; reason: "item" | "quantity" } => {
  const item = draft.item.trim();
  const characters = Array.from(item);
  const containsControlCharacter = characters.some((character) => /[\u0000-\u001f\u007f-\u009f]/u.test(character));
  if (characters.length < 2 || characters.length > 80 || containsControlCharacter) {
    return { valid: false, reason: "item" };
  }
  if (!Number.isInteger(draft.quantity) || draft.quantity < 1 || draft.quantity > 20) {
    return { valid: false, reason: "quantity" };
  }
  return { valid: true, item, quantity: draft.quantity };
};

export const createResponseGate = () => {
  let latest = 0;
  return {
    begin: () => ++latest,
    isLatest: (token: number) => token === latest,
  };
};
