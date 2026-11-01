export type OrderStatus = "new" | "preparing" | "ready";
export type OrderFilter = "all" | OrderStatus;

export type Order = {
  id: number;
  item: string;
  quantity: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
};

export type DashboardStats = {
  total: number;
  new: number;
  preparing: number;
  ready: number;
};

export type OrderDraft = {
  item: string;
  quantity: number;
};
