"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { SiteContent } from "@/content/site";
import { createOrder, listOrders, updateOrderStatus } from "./api-client";
import { calculateStats, filterOrders, getNextStatus, validateOrderDraft } from "./lab-domain";
import type { Order, OrderFilter, OrderStatus } from "./types";

type ConnectionState = "connecting" | "live" | "reconnecting";

export function LabDashboard({ content }: { content: SiteContent["lab"] }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [pendingOrderID, setPendingOrderID] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [connection, setConnection] = useState<ConnectionState>("connecting");
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState(1);
  const itemInput = useRef<HTMLInputElement>(null);
  const quantityInput = useRef<HTMLInputElement>(null);

  const loadOrders = useCallback(async () => {
    try {
      const result = await listOrders();
      setOrders(result);
      setError(null);
    } catch {
      setError(content.loadError);
    } finally {
      setIsLoading(false);
    }
  }, [content.loadError]);

  useEffect(() => {
    let isActive = true;
    void listOrders()
      .then((result) => {
        if (!isActive) return;
        setOrders(result);
        setError(null);
      })
      .catch(() => {
        if (isActive) setError(content.loadError);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });
    const events = new EventSource("/api/events");
    events.onopen = () => setConnection("live");
    events.addEventListener("orders-changed", () => void loadOrders());
    events.onerror = () => setConnection("reconnecting");
    return () => {
      isActive = false;
      events.close();
    };
  }, [content.loadError, loadOrders]);

  const visibleOrders = useMemo(() => filterOrders(orders, filter), [filter, orders]);
  const stats = useMemo(() => calculateStats(orders), [orders]);

  const submitOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateOrderDraft({ item, quantity });
    if (!validation.valid) {
      setFormError(validation.reason === "item" ? content.itemError : content.quantityError);
      if (validation.reason === "item") itemInput.current?.focus();
      else quantityInput.current?.focus();
      return;
    }

    setIsCreating(true);
    setFormError(null);
    try {
      const created = await createOrder({ item: validation.item, quantity: validation.quantity });
      setOrders((current) => [created, ...current.filter((order) => order.id !== created.id)]);
      setItem("");
      setQuantity(1);
    } catch {
      setFormError(content.mutationError);
    } finally {
      setIsCreating(false);
    }
  };

  const advanceOrder = async (order: Order) => {
    const nextStatus = getNextStatus(order.status);
    if (!nextStatus) return;
    setPendingOrderID(order.id);
    setError(null);
    try {
      const updated = await updateOrderStatus(order.id, nextStatus);
      setOrders((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch {
      setError(content.mutationError);
    } finally {
      setPendingOrderID(null);
    }
  };

  const filters: OrderFilter[] = ["all", "new", "preparing", "ready"];
  const statKeys = ["total", "new", "preparing", "ready"] as const;

  return (
    <section className="lab-dashboard" aria-label={content.title}>
      <div className="lab-topline">
        <p className="demo-notice">{content.fictionalNotice}</p>
        <p className={`connection connection-${connection}`} role="status">
          <span aria-hidden="true" />{content.connectionLabels[connection]}
        </p>
      </div>

      <div className="stats-grid" aria-label="Dashboard statistics">
        {statKeys.map((key) => <article className="stat" key={key}><strong>{stats[key]}</strong><span>{content.statsLabels[key]}</span></article>)}
      </div>

      <div className="lab-workspace">
        <form className="order-form" onSubmit={submitOrder} noValidate>
          <h2>{content.createTitle}</h2>
          <label htmlFor="order-item">{content.itemLabel}</label>
          <input ref={itemInput} id="order-item" name="item" value={item} onChange={(event) => setItem(event.target.value)} placeholder={content.itemPlaceholder} maxLength={80} autoComplete="off" aria-invalid={formError === content.itemError} aria-describedby={formError ? "order-form-error" : undefined} />
          <label htmlFor="order-quantity">{content.quantityLabel}</label>
          <input ref={quantityInput} id="order-quantity" name="quantity" type="number" inputMode="numeric" min={1} max={20} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} autoComplete="off" aria-invalid={formError === content.quantityError} />
          {formError ? <p className="form-error" id="order-form-error" role="alert">{formError}</p> : null}
          <button className="button button-primary" type="submit" disabled={isCreating}>{isCreating ? content.creatingAction : content.createAction}</button>
        </form>

        <div className="order-board">
          <div className="filter-bar" role="group" aria-label={content.filtersLabel}>
            {filters.map((value) => (
              <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>
                {value === "all" ? content.allFilter : content.statusLabels[value]}
              </button>
            ))}
          </div>

          {error ? <div className="lab-error" role="alert"><p>{error}</p><button className="text-link" type="button" onClick={() => void loadOrders()}>{content.retry}</button></div> : null}
          {isLoading ? <p className="lab-state" role="status">{content.loading}</p> : null}
          {!isLoading && visibleOrders.length === 0 ? <p className="lab-state">{content.empty}</p> : null}

          <div className="orders" aria-live="polite">
            {visibleOrders.map((order) => {
              const nextStatus = getNextStatus(order.status);
              return (
                <article className="order-card" key={order.id}>
                  <div className="order-number">#{String(order.id).padStart(3, "0")}</div>
                  <div className="order-copy"><h3>{order.item}</h3><p>{content.quantityLabel}: {order.quantity}</p></div>
                  <span className={`status status-${order.status}`}>{content.statusLabels[order.status]}</span>
                  {nextStatus ? (
                    <button className="button order-action" type="button" disabled={pendingOrderID === order.id} onClick={() => void advanceOrder(order)}>
                      {content.nextActions[order.status as Exclude<OrderStatus, "ready">]}
                    </button>
                  ) : <span className="order-complete"><span aria-hidden="true">✓</span><span className="sr-only">{content.statusLabels.ready}</span></span>}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
