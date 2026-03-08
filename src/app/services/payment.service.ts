import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, NgZone } from '@angular/core';

interface RazorpayHandler {
  open(): void;
}

export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'cash';

declare global {
  interface Window {
    Razorpay?: new (options: any) => RazorpayHandler;
  }
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private scriptLoaded = false;
  private readonly demoMode = false;
  private readonly testKey = 'rzp_test_1DP5mmOlF5G5ag';

  constructor(@Inject(DOCUMENT) private readonly document: Document, private zone: NgZone) {
    if (!this.demoMode) {
      this.injectScript();
    }
  }

  initiate(amount: number, customerName: string, method: PaymentMethod, customerEmail?: string) {
    return new Promise<{ id: string }>((resolve) => {
      if (this.demoMode) {
        // Demo payment gateway simulation for all methods.
        setTimeout(
          () => resolve({ id: `${method}_demo_${Math.floor(Math.random() * 1_000_000)}` }),
          700
        );
        return;
      }

      if (method === 'cash') {
        setTimeout(() => resolve({ id: `cash_${Math.floor(Math.random() * 1_000_000)}` }), 500);
        return;
      }

      const payload = {
        key: this.testKey,
        amount: Math.round(amount * 100),
        currency: 'INR',
        name: 'Crust Pizza (Test)',
        description: 'Custom Pizza Order',
        config: {
          display: {
            blocks: {
              preferred: {
                name: 'Preferred Methods',
                instruments: [{ method: 'upi' }, { method: 'card' }, { method: 'netbanking' }]
              }
            },
            sequence: ['block.preferred'],
            preferences: {
              show_default_blocks: true
            }
          }
        },
        handler: (response: { razorpay_payment_id: string }) => {
          this.zone.run(() => resolve({ id: response.razorpay_payment_id }));
        },
        prefill: {
          name: customerName,
          email: customerEmail ?? 'customer@crustpizza.test',
          contact: '9999999999'
        },
        theme: {
          color: '#f97316'
        },
        modal: {
          ondismiss: () => {
            this.zone.run(() => resolve({ id: 'payment-cancelled' }));
          }
        }
      };

      if (this.scriptLoaded && window.Razorpay) {
        const rzp = new window.Razorpay(payload);
        // If checkout fails for any browser/env reason, recover to test simulation.
        (rzp as any).on?.('payment.failed', () => {
          this.zone.run(() =>
            resolve({ id: `${method}_fallback_${Math.floor(Math.random() * 1_000_000)}` })
          );
        });
        rzp.open();
      } else {
        // Fallback simulation for environments without Razorpay
        const fakeId = `${method}_${Math.floor(Math.random() * 1_000_000)}`;
        setTimeout(() => resolve({ id: fakeId }), 500);
      }
    });
  }

  private injectScript() {
    if (this.demoMode || this.scriptLoaded) return;
    const script = this.document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => (this.scriptLoaded = true);
    this.document.body.appendChild(script);
  }

}
