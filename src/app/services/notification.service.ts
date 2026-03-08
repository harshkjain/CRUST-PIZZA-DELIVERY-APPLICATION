import { Injectable, signal } from '@angular/core';
import { InventoryCategory, InventoryItem } from './inventory.service';

export interface NotificationMessage {
  id: string;
  createdAt: number;
  text: string;
  type: 'info' | 'warning' | 'success';
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly queueKey = 'pizza_notification_queue';
  readonly messages = signal<NotificationMessage[]>([]);
  readonly adminEmail = 'admin@pizza.com';
  private emailQueue = this.loadQueue();
  private timer?: ReturnType<typeof setInterval>;

  constructor() {
    this.startDispatcher();
  }

  push(text: string, type: NotificationMessage['type'] = 'info') {
    const msg: NotificationMessage = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      text,
      type
    };
    this.messages.update((prev) => [msg, ...prev].slice(0, 20));
  }

  queueLowStock(items: { category: InventoryCategory; item: InventoryItem }[]) {
    const now = Date.now();
    items.forEach(({ item, category }) => {
      const key = `${category}:${item.id}`;
      const previous = this.emailQueue[key];
      const nextCount = previous ? previous.count + 1 : 1;
      this.emailQueue[key] = {
        category,
        itemId: item.id,
        itemName: item.name,
        stock: item.stock,
        threshold: item.threshold,
        count: nextCount,
        notifyAt: now + 60_000
      };
      this.persistQueue();
      this.push(
        `Low stock for ${item.name} (${category}). Alert scheduled to ${this.adminEmail}.`,
        'warning'
      );
    });
  }

  private startDispatcher() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      const now = Date.now();
      Object.values(this.emailQueue).forEach((entry) => {
        if (entry.notifyAt > now || entry.count < 2) return;
        this.push(
          `Email sent to ${this.adminEmail}: ${entry.itemName} is ${entry.stock} (threshold ${entry.threshold}) after ${entry.count} consecutive low-stock checks.`,
          'info'
        );
        delete this.emailQueue[`${entry.category}:${entry.itemId}`];
      });
      this.persistQueue();
    }, 10_000);
  }

  private loadQueue(): Record<string, ScheduledEmail> {
    const raw = this.storage()?.getItem(this.queueKey) ?? null;
    return raw ? (JSON.parse(raw) as Record<string, ScheduledEmail>) : {};
  }

  private persistQueue() {
    this.storage()?.setItem(this.queueKey, JSON.stringify(this.emailQueue));
  }

  private storage(): Storage | null {
    const value = (globalThis as { localStorage?: Storage }).localStorage;
    return value && typeof value.getItem === 'function' ? value : null;
  }
}

interface ScheduledEmail {
  category: InventoryCategory;
  itemId: string;
  itemName: string;
  stock: number;
  threshold: number;
  count: number;
  notifyAt: number;
}
