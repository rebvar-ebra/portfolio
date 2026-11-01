import type { Order, OrderDraft, OrderStatus } from "./types";

type APIErrorBody = { error?: { message?: string } };

const request = async <Result>(path: string, init?: RequestInit): Promise<Result> => {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as APIErrorBody;
    throw new Error(body.error?.message ?? `API request failed (${response.status})`);
  }

  return response.json() as Promise<Result>;
};

export const listOrders = () => request<Order[]>("/api/orders", { cache: "no-store" });

export const createOrder = (draft: OrderDraft) =>
  request<Order>("/api/orders", { method: "POST", body: JSON.stringify(draft) });

export const updateOrderStatus = (id: number, status: OrderStatus) =>
  request<Order>(`/api/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
