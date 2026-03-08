import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CheckoutService } from '../services/checkout.service';
import { OrderService } from '../services/order.service';
import { PaymentMethod, PaymentService } from '../services/payment.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="shell">
      <section class="card header">
        <div>
          <p class="eyebrow">Crust Pizza</p>
          <h2>Secure payment</h2>
          <p class="muted">Complete payment to place and confirm your order.</p>
        </div>
        <a class="btn ghost" routerLink="/user">Back to builder</a>
      </section>

      <section class="card" *ngIf="draft(); else noDraft">
        <div class="layout">
          <div class="summary">
            <h3>Order summary</h3>
            <p>{{ draft()!.selection.base }} | {{ draft()!.selection.sauce }} | {{ draft()!.selection.cheese }}</p>
            <p class="muted">Veggies: {{ draft()!.selection.veggies.join(', ') || 'None' }}</p>
            <p class="muted">Meat: {{ draft()!.selection.meats.join(', ') || 'None' }}</p>
            <p class="muted" *ngIf="draft()!.selection.addOns?.length">
              Add-ons:
              {{ addOnSummary(draft()!.selection.addOns!) }}
            </p>
            <h2>INR {{ draft()!.total }}</h2>
          </div>

          <div class="pay-panel">
            <h3>Choose payment method</h3>
            <div class="method-grid">
              <button class="method" [class.active]="method() === 'upi'" (click)="method.set('upi')">UPI</button>
              <button class="method" [class.active]="method() === 'card'" (click)="method.set('card')">Debit/Card</button>
              <button class="method" [class.active]="method() === 'netbanking'" (click)="method.set('netbanking')">Net Banking</button>
              <button class="method" [class.active]="method() === 'cash'" (click)="method.set('cash')">Cash</button>
            </div>

            <div class="method-body" *ngIf="method() === 'upi'">
              <h4>UPI QR</h4>
              <div class="qr-wrap">
                <img
                  alt="UPI QR"
                  [src]="upiQrUrl()"
                />
              </div>
              <p class="muted">Scan using any UPI app in test/demo mode.</p>
            </div>

            <div class="method-body" *ngIf="method() === 'netbanking'">
              <h4>Select bank</h4>
              <select [(ngModel)]="selectedBank">
                <option *ngFor="let bank of banks" [value]="bank">{{ bank }}</option>
              </select>
            </div>

            <div class="method-body razor" *ngIf="method() !== 'cash'">
              <span class="pulse"></span>
              <p>Razorpay Test Checkout Enabled</p>
            </div>

            <div class="actions">
              <button class="btn danger" (click)="cancelCheckout()">Cancel order</button>
              <button class="btn primary" (click)="payNow()">Pay now</button>
            </div>
          </div>
        </div>
      </section>

      <ng-template #noDraft>
        <section class="card">
          <p class="muted">No active checkout. Please build your pizza first.</p>
          <a class="btn ghost" routerLink="/user">Go to builder</a>
        </section>
      </ng-template>

      <div class="payment-success" *ngIf="showSuccess()">
        <div class="success-card">
          <div class="ring"></div>
          <div class="check">OK</div>
          <h3>Payment successful</h3>
          <p>Order placed and confirmed.</p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .shell { padding: 1.2rem; display: grid; gap: 1rem; }
      .card { background: var(--surface); border: 1px solid var(--border-soft); border-radius: 1rem; padding: 1rem; }
      .header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
      .layout { display: grid; grid-template-columns: 1fr 1.2fr; gap: 1rem; }
      .summary { border: 1px solid var(--border-soft); border-radius: 0.8rem; padding: 0.9rem; background: var(--surface-raised); }
      .pay-panel { border: 1px solid var(--border-soft); border-radius: 0.8rem; padding: 0.9rem; background: var(--surface-raised); }
      .method-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }
      .method { border: 1px solid var(--border-soft); background: #fff; border-radius: 0.7rem; padding: 0.6rem; font-weight: 700; cursor: pointer; }
      .method.active { background: linear-gradient(120deg, #0ea5e9, #2563eb); color: #fff; border: none; }
      .method-body { margin-top: 0.8rem; }
      .qr-wrap { width: 190px; height: 190px; border: 1px solid var(--border-soft); border-radius: 0.6rem; display: grid; place-items: center; background: white; }
      select { width: 100%; padding: 0.65rem; border-radius: 0.6rem; border: 1px solid var(--border-soft); }
      .razor { margin-top: 0.8rem; display: flex; align-items: center; gap: 0.5rem; color: #2563eb; font-weight: 700; }
      .pulse { width: 10px; height: 10px; border-radius: 50%; background: #2563eb; animation: pulse 1.1s ease-in-out infinite; }
      .actions { margin-top: 1rem; display: flex; justify-content: space-between; gap: 0.7rem; }
      .btn { border-radius: 0.7rem; padding: 0.65rem 0.95rem; border: 1px solid var(--border-soft); cursor: pointer; text-decoration: none; }
      .btn.primary { background: linear-gradient(120deg, #fb923c, #f97316); color: #fff; border: none; }
      .btn.ghost { background: var(--surface-raised); color: var(--text-primary); }
      .btn.danger { background: #ef4444; color: #fff; border: none; }
      .muted { color: var(--text-muted); }
      .eyebrow { text-transform: uppercase; letter-spacing: 0.08em; color: var(--accent); font-weight: 700; }
      .payment-success { position: fixed; inset: 0; background: rgba(2, 6, 23, 0.4); display: grid; place-items: center; z-index: 40; }
      .success-card { width: 320px; background: #fff; border-radius: 1.2rem; padding: 1.4rem; text-align: center; position: relative; animation: pop 420ms var(--motion-smooth); }
      .ring { width: 94px; height: 94px; margin: 0 auto; border-radius: 50%; border: 6px solid #22c55e; border-left-color: transparent; animation: spin 900ms ease-in-out; }
      .check { position: absolute; left: 50%; top: 2.8rem; transform: translateX(-50%); width: 50px; height: 50px; border-radius: 50%; background: #22c55e; color: #fff; display: grid; place-items: center; font-size: 1.6rem; font-weight: 800; animation: pulsePop 900ms ease-in-out; }
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes pop { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }
      @keyframes pulse { 0%,100%{ transform: scale(1); } 50% { transform: scale(1.25); } }
      @keyframes pulsePop { 0% { transform: translateX(-50%) scale(0.8); } 60% { transform: translateX(-50%) scale(1.1); } 100% { transform: translateX(-50%) scale(1); } }
      @media (max-width: 900px) { .layout { grid-template-columns: 1fr; } .method-grid { grid-template-columns: 1fr 1fr; } }
    `
  ]
})
export class PaymentComponent {
  draft = computed(() => this.checkout.draft());
  method = signal<PaymentMethod>('upi');
  showSuccess = signal(false);
  banks = ['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak Mahindra Bank'];
  selectedBank = this.banks[0];

  constructor(
    private auth: AuthService,
    private checkout: CheckoutService,
    private payment: PaymentService,
    private orders: OrderService,
    private router: Router
  ) {}

  payNow() {
    const draft = this.checkout.draft();
    if (!draft) return;
    const mode = this.method() === 'netbanking' ? 'netbanking' : this.method();
    this.payment
      .initiate(draft.total, this.auth.currentUser()?.name ?? 'Customer', mode, this.auth.currentUser()?.email)
      .then((res) => {
        if (res.id === 'payment-cancelled') return;

        const paymentId =
          this.method() === 'netbanking' ? `${this.selectedBank.replace(/\s+/g, '_')}_${res.id}` : res.id;
        const order = this.orders.createOrder(
          this.auth.currentUser()!.email,
          draft.selection,
          draft.total,
          this.method()
        );
        const result = this.orders.markPaid(order.id, paymentId);
        if (!result.ok) return;
        this.showSuccess.set(true);
        this.checkout.clear();
        setTimeout(() => {
          this.showSuccess.set(false);
          this.router.navigate(['/orders']);
        }, 1400);
      });
  }

  cancelCheckout() {
    this.checkout.clear();
    this.router.navigate(['/orders']);
  }

  upiQrUrl() {
    const amount = this.checkout.draft()?.total ?? 0;
    return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi%3A%2F%2Fpay%3Fpa%3Dcrustpizza%40upi%26pn%3DCrust%2520Pizza%26am%3D${amount}`;
  }

  addOnSummary(addOns: { name: string; price: number }[]) {
    return addOns.map((addon) => `${addon.name} (+INR ${addon.price})`).join(' | ');
  }
}
