import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { OrderService, OrderStatus } from '../services/order.service';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="shell">
      <section class="card header">
        <div>
          <p class="eyebrow">Crust Pizza</p>
          <h2>Order history</h2>
          <p class="muted">Track all your payments and delivery stages in one premium timeline.</p>
        </div>
        <a class="btn" routerLink="/user">Back to dashboard</a>
      </section>

      <section class="card" *ngIf="orders().length; else noOrders">
        <div class="history-list">
          <article class="history-item" *ngFor="let order of orders()">
            <div>
              <p class="muted">{{ order.createdAt | date:'medium' }}</p>
              <h3>INR {{ order.total }}</h3>
              <p class="muted">
                Method: {{ order.paymentMethod | titlecase }} | Ref: {{ order.paymentId ?? 'Pending' }}
              </p>
              <p>{{ order.selections.base }} | {{ order.selections.sauce }} | {{ order.selections.cheese }}</p>
              <p class="muted" *ngIf="order.selections.addOns?.length">
                Add-ons: {{ addOnSummary(order.selections.addOns!) }}
              </p>
              <button class="btn danger" *ngIf="canCancel(order.status)" (click)="cancel(order.id)">Cancel order</button>
              <p class="success" *ngIf="messageByOrder()[order.id]">{{ messageByOrder()[order.id] }}</p>
            </div>
            <div class="status-col">
              <span class="pill" [ngClass]="'status-' + order.status">{{ label(order.status) }}</span>
              <div class="timeline">
                <span class="bar" [style.width.%]="timelineWidth(order.status)"></span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <ng-template #noOrders>
        <section class="card">
          <p class="muted">No orders yet.</p>
        </section>
      </ng-template>
    </div>
  `,
  styles: [
    `
      .shell { padding: 1.2rem; display: grid; gap: 1rem; }
      .card { background: var(--surface); border: 1px solid var(--border-soft); border-radius: 1rem; padding: 1rem; }
      .header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
      .history-list { display: grid; gap: 0.7rem; }
      .history-item { display: flex; justify-content: space-between; gap: 1rem; border: 1px solid var(--border-soft); border-radius: 0.8rem; padding: 0.9rem; animation: rise 360ms var(--motion-smooth); }
      .status-col { min-width: 220px; text-align: right; }
      .pill { border-radius: 999px; display: inline-block; padding: 0.32rem 0.7rem; color: #fff; margin-bottom: 0.4rem; }
      .timeline { height: 10px; background: rgba(148, 163, 184, 0.25); border-radius: 999px; overflow: hidden; }
      .bar { display: block; height: 100%; background: linear-gradient(90deg, #0ea5e9, #22c55e); transition: width 520ms var(--motion-smooth); }
      .status-payment_pending { background: #94a3b8; }
      .status-confirmed { background: #16a34a; }
      .status-order_received { background: #0284c7; }
      .status-in_kitchen { background: #f59e0b; }
      .status-sent_to_delivery { background: #7c3aed; }
      .status-delivered { background: #22c55e; }
      .status-cancelled { background: #ef4444; }
      .btn { border: 1px solid var(--border-soft); border-radius: 0.75rem; padding: 0.65rem 0.9rem; text-decoration: none; background: var(--surface-raised); }
      .btn.danger { margin-top: 0.6rem; background: #ef4444; color: #fff; border: none; cursor: pointer; }
      .success { color: #16a34a; margin-top: 0.45rem; }
      .muted { color: var(--text-muted); }
      .eyebrow { text-transform: uppercase; letter-spacing: 0.08em; color: var(--accent); font-weight: 700; }
      @keyframes rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      @media (max-width: 780px) {
        .header, .history-item { flex-direction: column; align-items: flex-start; }
        .status-col { width: 100%; text-align: left; }
      }
    `
  ]
})
export class OrderHistoryComponent {
  messageByOrder = signal<Record<string, string>>({});
  orders = computed(() =>
    this.orderService
      .orders()
      .filter(
        (o) =>
          o.userEmail === (this.auth.currentUser()?.email ?? '') &&
          o.status !== 'payment_pending'
      )
  );

  constructor(private auth: AuthService, private orderService: OrderService) {}

  canCancel(status: OrderStatus) {
    return !['sent_to_delivery', 'delivered', 'cancelled'].includes(status);
  }

  cancel(orderId: string) {
    const email = this.auth.currentUser()?.email ?? '';
    const result = this.orderService.cancelByUser(orderId, email);
    this.messageByOrder.update((prev) => ({
      ...prev,
      [orderId]: result.message
    }));
  }

  label(status: OrderStatus) {
    const labels: Record<OrderStatus, string> = {
      payment_pending: 'Awaiting payment',
      confirmed: 'Confirmed',
      order_received: 'Order received',
      in_kitchen: 'In the kitchen',
      sent_to_delivery: 'Sent to delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    return labels[status];
  }

  timelineWidth(status: OrderStatus) {
    const map: Record<OrderStatus, number> = {
      payment_pending: 10,
      confirmed: 25,
      order_received: 45,
      in_kitchen: 65,
      sent_to_delivery: 85,
      delivered: 100,
      cancelled: 100
    };
    return map[status];
  }

  addOnSummary(addOns: { name: string; price: number }[]) {
    return addOns.map((addon) => `${addon.name} (+INR ${addon.price})`).join(' | ');
  }
}
