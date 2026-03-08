import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { InventoryCategory, InventoryItem, InventoryService } from '../services/inventory.service';
import { NotificationService } from '../services/notification.service';
import { Order, OrderService, OrderStatus } from '../services/order.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="shell">
      <section class="hero card">
        <div>
          <div class="hero-brand">
            <img src="/brand/crust-logo.svg" alt="Crust Pizza logo" />
            <span>Original Crust Pizza</span>
          </div>
          <p class="eyebrow">Crust Pizza Admin Portal</p>
          <h2>Admin Control Hub</h2>
          <p class="muted">Manage inventory, order progression, and stock alerts from one premium control panel.</p>
          <div class="toolbar-actions">
            <a class="btn ghost" routerLink="/">Home</a>
            <button class="btn" (click)="logout()">Logout</button>
          </div>
        </div>
        <div class="hero-visual" aria-hidden="true">
          <div class="logo-badge">
            <img src="/brand/crust-logo.svg" alt="" />
          </div>
          <div class="visual-copy">Fresh Pizza Kitchen</div>
        </div>
      </section>

      <section class="card access-note">
        <h3>Admin Access Details</h3>
        <p class="muted">Demo admin login: <strong>admin@pizza.com</strong> / <strong>Admin@123</strong></p>
      </section>

      <section class="stats">
        <article class="card stat">
          <p>Total Stock Units</p>
          <h3>{{ totalStock() }}</h3>
        </article>
        <article class="card stat">
          <p>Low Stock Items</p>
          <h3>{{ lowStock().length }}</h3>
        </article>
        <article class="card stat">
          <p>Total Orders</p>
          <h3>{{ orders().length }}</h3>
        </article>
        <article class="card stat">
          <p>Pending Orders</p>
          <h3>{{ pendingOrders() }}</h3>
        </article>
      </section>

      <section class="grid">
        <div class="card">
          <div class="card-header">
            <h3>Inventory Management</h3>
            <p class="muted">Track base, sauce, cheese, veggies and meat stock.</p>
          </div>

          <div class="inventory" *ngFor="let category of categories">
            <div class="inventory-head">
              <h4>{{ categoryLabel(category) }}</h4>
              <span class="muted">Alert when repeated low stock is detected</span>
            </div>
            <div class="table">
              <div class="row head">
                <span>Item</span>
                <span>Stock</span>
                <span>Threshold</span>
                <span>Actions</span>
              </div>
              <div class="row" *ngFor="let item of inventory()[category]">
                <span>{{ item.name }}</span>
                <span>{{ item.stock }}</span>
                <span>
                  <input type="number" [(ngModel)]="item.threshold" min="0" (change)="updateThreshold(category, item)" />
                </span>
                <span class="actions">
                  <button (click)="changeStock(category, item, -1)">-</button>
                  <button (click)="changeStock(category, item, 1)">+</button>
                </span>
              </div>
            </div>
          </div>

          <div *ngIf="lowStock().length" class="alert">
            <p *ngFor="let entry of lowStock()">Low stock: {{ entry.item.name }} in {{ categoryLabel(entry.category) }} ({{ entry.item.stock }} left)</p>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>Orders Pipeline</h3>
            <p class="muted">Advance order status: received -> kitchen -> delivery.</p>
          </div>
          <div class="order-list" *ngIf="orders().length; else emptyOrders">
            <div class="order-row" *ngFor="let order of orders()">
              <div>
                <p class="muted">{{ order.createdAt | date:'medium' }} | {{ order.userEmail }}</p>
                <p>{{ summarize(order) }}</p>
                <p class="muted">Total INR {{ order.total }} | Payment: {{ order.paymentId ?? 'Pending' }}</p>
              </div>
              <div class="status">
                <span class="pill" [ngClass]="statusClass(order.status)">{{ label(order.status) }}</span>
                <div class="status-actions" *ngIf="order.status !== 'cancelled'">
                  <button *ngFor="let next of nextStatuses(order)" (click)="updateStatus(order, next)">{{ label(next) }}</button>
                </div>
              </div>
            </div>
          </div>
          <ng-template #emptyOrders><p class="muted">No orders yet.</p></ng-template>
        </div>
      </section>

      <section class="card" *ngIf="notifications().length">
        <h3>Scheduled alert log</h3>
        <ul class="notifications">
          <li *ngFor="let note of notifications()">{{ note.text }} | {{ note.createdAt | date:'shortTime' }}</li>
        </ul>
      </section>
    </div>
  `,
  styles: [
    `
      .shell { padding: 1.2rem; display: grid; gap: 1rem; }
      .card {
        background: var(--surface);
        border: 1px solid var(--border-soft);
        border-radius: 1rem;
        padding: 1.1rem;
        animation: rise 420ms var(--motion-smooth);
      }

      .hero { display: grid; grid-template-columns: 1fr 280px; gap: 1rem; align-items: center; }
      .hero-brand {
        display: inline-flex;
        align-items: center;
        gap: 0.55rem;
        margin-bottom: 0.35rem;
        padding: 0.28rem 0.5rem 0.28rem 0.3rem;
        border-radius: 999px;
        border: 1px solid var(--border-soft);
        background: linear-gradient(120deg, rgba(249, 115, 22, 0.1), rgba(2, 132, 199, 0.1));
        animation: rise 420ms var(--motion-smooth);
      }
      .hero-brand img {
        width: 1.7rem;
        height: 2.2rem;
        border-radius: 0.55rem;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
      }
      .hero-brand span { font-weight: 700; font-size: 0.86rem; color: var(--text-primary); }
      .hero-visual {
        height: 200px;
        border-radius: 1rem;
        border: 1px solid var(--border-soft);
        background:
          linear-gradient(145deg, rgba(15, 23, 42, 0.52), rgba(15, 23, 42, 0.2)),
          url('https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1400&q=80')
            center/cover;
        position: relative;
        overflow: hidden;
      }
      .hero-visual::before {
        content: '';
        position: absolute;
        inset: 0;
        background:
          radial-gradient(circle at 86% 16%, rgba(251, 146, 60, 0.32), transparent 26%),
          radial-gradient(circle at 10% 88%, rgba(14, 165, 233, 0.22), transparent 30%);
      }
      .logo-badge {
        position: absolute;
        left: 0.9rem;
        bottom: 0.9rem;
        width: 82px;
        height: 108px;
        border-radius: 0.8rem;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.24);
        box-shadow: 0 12px 20px rgba(0, 0, 0, 0.28);
        animation: pulse 3.4s ease-in-out infinite;
      }
      .logo-badge img { width: 100%; height: 100%; object-fit: cover; }
      .visual-copy {
        position: absolute;
        right: 0.9rem;
        bottom: 0.9rem;
        color: #fff;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        background: rgba(15, 23, 42, 0.52);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 999px;
        padding: 0.35rem 0.75rem;
        backdrop-filter: blur(4px);
      }

      .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.8rem; }
      .access-note h3 { margin: 0 0 0.35rem; }
      .stat p { margin: 0; color: var(--text-muted); }
      .stat h3 { margin: 0.35rem 0 0; font-size: 1.7rem; }

      .toolbar-actions { display: flex; gap: 0.6rem; }
      .grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 1rem; }
      .card-header { display: flex; align-items: center; justify-content: space-between; gap: 0.6rem; }
      .inventory { margin-top: 0.8rem; }
      .inventory-head { display: flex; align-items: center; justify-content: space-between; }
      .table { border: 1px solid var(--border-soft); border-radius: 0.7rem; overflow: hidden; }
      .row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; align-items: center; padding: 0.6rem 0.7rem; }
      .row.head { background: var(--surface-raised); font-weight: 700; }
      .row:nth-child(even) { background: rgba(255, 255, 255, 0.03); }

      input[type='number'] {
        width: 80px;
        border-radius: 0.55rem;
        border: 1px solid var(--border-soft);
        background: var(--surface-raised);
        color: var(--text-primary);
        padding: 0.45rem;
      }

      .actions { display: flex; gap: 0.35rem; }
      .actions button {
        border: 1px solid var(--border-soft);
        background: var(--surface-raised);
        color: var(--text-primary);
        padding: 0.35rem 0.55rem;
        border-radius: 0.5rem;
        cursor: pointer;
        transition: transform var(--motion-fast), background var(--motion-fast);
      }
      .actions button:active { transform: scale(0.95); }

      .alert { margin-top: 0.8rem; background: #fff7ed; border: 1px solid #fdba74; color: #9a3412; padding: 0.7rem; border-radius: 0.7rem; }
      .order-row {
        display: flex; align-items: center; justify-content: space-between; gap: 0.7rem;
        border: 1px solid var(--border-soft); border-radius: 0.8rem; padding: 0.8rem; margin-bottom: 0.6rem;
        transition: transform var(--motion-fast), box-shadow var(--motion-fast);
      }
      .order-row:hover { transform: translateY(-2px); box-shadow: 0 14px 22px rgba(0, 0, 0, 0.12); }
      .status { text-align: right; }
      .pill { border-radius: 999px; padding: 0.32rem 0.74rem; color: #fff; display: inline-block; }
      .status-payment_pending { background: #94a3b8; }
      .status-confirmed { background: #16a34a; }
      .status-order_received { background: #0284c7; }
      .status-in_kitchen { background: #f59e0b; }
      .status-sent_to_delivery { background: #7c3aed; }
      .status-delivered { background: #22c55e; }
      .status-cancelled { background: #ef4444; }

      .status-actions { margin-top: 0.4rem; display: flex; flex-wrap: wrap; gap: 0.3rem; justify-content: flex-end; }
      .status-actions button {
        background: #1f2937; color: #fff; border: none; padding: 0.38rem 0.62rem;
        border-radius: 0.55rem; cursor: pointer;
        transition: transform var(--motion-fast), box-shadow var(--motion-fast), opacity var(--motion-fast);
      }
      .status-actions button:hover { box-shadow: 0 8px 14px rgba(0, 0, 0, 0.16); }
      .status-actions button:active { transform: scale(0.96); }

      .notifications { margin: 0.4rem 0 0; padding: 0; list-style: none; }
      .notifications li { border: 1px solid var(--border-soft); border-radius: 0.6rem; padding: 0.45rem 0.6rem; margin-top: 0.45rem; }

      .btn {
        border: 1px solid var(--border-soft); background: #1f2937; color: #fff;
        padding: 0.65rem 0.9rem; border-radius: 0.75rem; cursor: pointer;
        transition: transform var(--motion-fast), box-shadow var(--motion-fast);
      }
      .btn.ghost { background: var(--surface-raised); color: var(--text-primary); }
      .btn:active { transform: scale(0.97); }
      .muted { color: var(--text-muted); }
      .eyebrow { text-transform: uppercase; letter-spacing: 0.08em; color: #0ea5e9; font-weight: 700; }

      @keyframes pulse { 0%,100%{ transform: scale(1); opacity: 0.92; } 50% { transform: scale(1.04); opacity: 1; } }
      @keyframes rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

      @media (max-width: 1200px) { .stats { grid-template-columns: repeat(2, 1fr); } }
      @media (max-width: 1100px) {
        .grid,
        .hero { grid-template-columns: 1fr; }
      }
      @media (max-width: 760px) {
        .stats { grid-template-columns: 1fr; }
        .row { grid-template-columns: 1fr; gap: 0.3rem; }
        .order-row { flex-direction: column; align-items: flex-start; }
        .status { text-align: left; width: 100%; }
        .status-actions { justify-content: flex-start; }
      }
    `
  ]
})
export class AdminDashboardComponent {
  categories: InventoryCategory[] = ['bases', 'sauces', 'cheeses', 'veggies', 'meats'];

  inventory = computed(() => this.inventoryService.inventory());
  lowStock = computed(() => this.inventoryService.getLowStock());
  orders = computed(() => this.orderService.orders());
  notifications = computed(() => this.notifier.messages());
  totalStock = computed(() =>
    (Object.keys(this.inventory()) as InventoryCategory[])
      .flatMap((key) => this.inventory()[key])
      .reduce((sum, item) => sum + item.stock, 0)
  );
  pendingOrders = computed(() =>
    this.orders().filter((o) => !['delivered', 'cancelled'].includes(o.status)).length
  );

  constructor(
    private auth: AuthService,
    private inventoryService: InventoryService,
    private orderService: OrderService,
    private notifier: NotificationService
  ) {}

  logout() {
    this.auth.logout();
  }

  changeStock(category: InventoryCategory, item: InventoryItem, delta: number) {
    this.inventoryService.updateStock(category, item.id, delta);
    const low = this.inventoryService.getLowStock();
    if (low.length) {
      this.notifier.queueLowStock(low);
    }
  }

  updateThreshold(category: InventoryCategory, item: InventoryItem) {
    this.inventoryService.setThreshold(category, item.id, item.threshold);
  }

  categoryLabel(cat: InventoryCategory) {
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  }

  summarize(order: Order) {
    const addOns =
      order.selections.addOns?.map((addon) => `${addon.name} (+INR ${addon.price})`).join(', ') ||
      'None';
    return `${order.selections.base} | ${order.selections.sauce} | ${order.selections.cheese} | Veggies: ${order.selections.veggies.join(', ') || 'None'} | Meat: ${order.selections.meats.join(', ') || 'None'} | Add-ons: ${addOns}`;
  }

  nextStatuses(order: Order): OrderStatus[] {
    if (order.status === 'cancelled' || order.status === 'delivered') {
      return [];
    }

    const flow: OrderStatus[] = [
      'payment_pending',
      'confirmed',
      'order_received',
      'in_kitchen',
      'sent_to_delivery',
      'delivered'
    ];
    const idx = flow.indexOf(order.status);
    return flow.filter((_, i) => i > idx);
  }

  updateStatus(order: Order, status: OrderStatus) {
    this.orderService.updateStatus(order.id, status);
  }

  label(status: OrderStatus) {
    const labels: Record<OrderStatus, string> = {
      payment_pending: 'Awaiting payment',
      confirmed: 'Confirmed',
      order_received: 'Order received',
      in_kitchen: 'In kitchen',
      sent_to_delivery: 'Sent to delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    return labels[status];
  }

  statusClass(status: OrderStatus) {
    return `status-${status}`;
  }
}
