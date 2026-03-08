import { Injectable, signal } from '@angular/core';
import { InventoryService } from './inventory.service';
import { NotificationService } from './notification.service';
import { PaymentMethod } from './payment.service';

export type OrderStatus =
  | 'payment_pending'
  | 'confirmed'
  | 'order_received'
  | 'in_kitchen'
  | 'sent_to_delivery'
  | 'delivered'
  | 'cancelled';

export interface PizzaSelection {
  base: string;
  sauce: string;
  cheese: string;
  veggies: string[];
  meats: string[];
  addOns?: PizzaAddOnSelection[];
}

export interface PizzaAddOnSelection {
  name: string;
  price: number;
}

export interface Order {
  id: string;
  userEmail: string;
  total: number;
  status: OrderStatus;
  selections: PizzaSelection;
  createdAt: number;
  paymentId?: string;
  paymentMethod?: PaymentMethod;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly key = 'pizza_orders';
  readonly orders = signal<Order[]>(this.load());

  constructor(
    private readonly inventory: InventoryService,
    private readonly notifier: NotificationService
  ) {}

  createOrder(
    userEmail: string,
    selections: PizzaSelection,
    total: number,
    paymentMethod: PaymentMethod
  ) {
    const order: Order = {
      id: crypto.randomUUID(),
      userEmail,
      total,
      status: 'payment_pending',
      selections,
      createdAt: Date.now(),
      paymentMethod
    };
    const updated = [order, ...this.orders()];
    this.persist(updated);
    return order;
  }

  markPaid(orderId: string, paymentId: string) {
    const order = this.orders().find((o) => o.id === orderId);
    if (!order) return { ok: false, message: 'Order not found.' };

    const stockResult = this.inventory.applyOrder(order.selections);
    if (!stockResult.ok) {
      const cancelled = this.orders().map((o) =>
        o.id === orderId ? ({ ...o, status: 'cancelled' as OrderStatus } as Order) : o
      );
      this.persist(cancelled);
      return { ok: false, message: 'Insufficient stock. Order cancelled.' };
    }

    const updated = this.orders().map((o) =>
      o.id === orderId ? ({ ...o, status: 'confirmed' as OrderStatus, paymentId } as Order) : o
    );
    this.persist(updated);
    if (stockResult.lowStock.length) {
      this.notifier.queueLowStock(stockResult.lowStock);
    }
    return { ok: true, message: 'Order confirmed.' };
  }

  updateStatus(orderId: string, status: OrderStatus) {
    const updated = this.orders().map((o) => (o.id === orderId ? { ...o, status } : o));
    this.persist(updated);
  }

  cancelByUser(orderId: string, userEmail: string) {
    const order = this.orders().find((o) => o.id === orderId);
    if (!order || order.userEmail !== userEmail) {
      return { ok: false, message: 'Order not found.' };
    }

    if (['sent_to_delivery', 'delivered', 'cancelled'].includes(order.status)) {
      return { ok: false, message: 'This order can no longer be cancelled.' };
    }

    if (order.status !== 'payment_pending') {
      this.inventory.restoreOrder(order.selections);
    }

    const updated = this.orders().map((o) =>
      o.id === orderId ? { ...o, status: 'cancelled' as OrderStatus } : o
    );
    this.persist(updated);
    return { ok: true, message: 'Order cancelled.' };
  }

  ordersForUser(email: string) {
    return this.orders().filter((o) => o.userEmail === email);
  }

  private load(): Order[] {
    const raw = this.storage()?.getItem(this.key) ?? null;
    return raw ? (JSON.parse(raw) as Order[]) : [];
  }

  private persist(orders: Order[]) {
    this.orders.set(orders);
    this.storage()?.setItem(this.key, JSON.stringify(orders));
  }

  private storage(): Storage | null {
    const value = (globalThis as { localStorage?: Storage }).localStorage;
    return value && typeof value.getItem === 'function' ? value : null;
  }
}
