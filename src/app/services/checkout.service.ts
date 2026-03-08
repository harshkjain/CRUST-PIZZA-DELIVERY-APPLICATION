import { Injectable, signal } from '@angular/core';
import { PizzaSelection } from './order.service';

export interface CheckoutDraft {
  total: number;
  selection: PizzaSelection;
}

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private readonly key = 'pizza_checkout_draft';
  readonly draft = signal<CheckoutDraft | null>(this.load());

  setDraft(draft: CheckoutDraft) {
    this.draft.set(draft);
    this.storage()?.setItem(this.key, JSON.stringify(draft));
  }

  clear() {
    this.draft.set(null);
    this.storage()?.removeItem(this.key);
  }

  private load(): CheckoutDraft | null {
    const raw = this.storage()?.getItem(this.key) ?? null;
    return raw ? (JSON.parse(raw) as CheckoutDraft) : null;
  }

  private storage(): Storage | null {
    const value = (globalThis as { localStorage?: Storage }).localStorage;
    return value && typeof value.getItem === 'function' ? value : null;
  }
}
