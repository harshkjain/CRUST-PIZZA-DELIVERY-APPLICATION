import { Injectable, signal } from '@angular/core';

export type InventoryCategory = 'bases' | 'sauces' | 'cheeses' | 'veggies' | 'meats';

export interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  threshold: number;
}

export interface InventoryState {
  bases: InventoryItem[];
  sauces: InventoryItem[];
  cheeses: InventoryItem[];
  veggies: InventoryItem[];
  meats: InventoryItem[];
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly key = 'pizza_inventory';
  readonly inventory = signal<InventoryState>(this.load());

  getLowStock() {
    const low: { category: InventoryCategory; item: InventoryItem }[] = [];
    const state = this.inventory();
    (Object.keys(state) as InventoryCategory[]).forEach((cat) => {
      state[cat].forEach((item) => {
        if (item.stock <= item.threshold) low.push({ category: cat, item });
      });
    });
    return low;
  }

  updateStock(category: InventoryCategory, id: string, delta: number) {
    const state = structuredClone(this.inventory());
    state[category] = state[category].map((item) =>
      item.id === id ? { ...item, stock: Math.max(0, item.stock + delta) } : item
    );
    this.persist(state);
  }

  setThreshold(category: InventoryCategory, id: string, threshold: number) {
    const state = structuredClone(this.inventory());
    state[category] = state[category].map((item) =>
      item.id === id ? { ...item, threshold } : item
    );
    this.persist(state);
  }

  applyOrder(consumption: {
    base: string;
    sauce: string;
    cheese: string;
    veggies: string[];
    meats: string[];
  }) {
    if (!this.canFulfill(consumption)) {
      return {
        ok: false,
        lowStock: this.getLowStock()
      };
    }

    const state = structuredClone(this.inventory());
    const dec = (cat: InventoryCategory, name: string) => {
      state[cat] = state[cat].map((item) =>
        item.name === name ? { ...item, stock: Math.max(0, item.stock - 1) } : item
      );
    };
    dec('bases', consumption.base);
    dec('sauces', consumption.sauce);
    dec('cheeses', consumption.cheese);
    consumption.veggies.forEach((v) => dec('veggies', v));
    consumption.meats.forEach((m) => dec('meats', m));
    this.persist(state);
    return {
      ok: true,
      lowStock: this.getLowStock()
    };
  }

  restoreOrder(consumption: {
    base: string;
    sauce: string;
    cheese: string;
    veggies: string[];
    meats: string[];
  }) {
    const state = structuredClone(this.inventory());
    const inc = (cat: InventoryCategory, name: string) => {
      state[cat] = state[cat].map((item) =>
        item.name === name ? { ...item, stock: item.stock + 1 } : item
      );
    };
    inc('bases', consumption.base);
    inc('sauces', consumption.sauce);
    inc('cheeses', consumption.cheese);
    consumption.veggies.forEach((v) => inc('veggies', v));
    consumption.meats.forEach((m) => inc('meats', m));
    this.persist(state);
  }

  canFulfill(consumption: {
    base: string;
    sauce: string;
    cheese: string;
    veggies: string[];
    meats: string[];
  }) {
    const state = this.inventory();
    const has = (cat: InventoryCategory, name: string) =>
      state[cat].some((item) => item.name === name && item.stock > 0);
    return (
      has('bases', consumption.base) &&
      has('sauces', consumption.sauce) &&
      has('cheeses', consumption.cheese) &&
      consumption.veggies.every((name) => has('veggies', name)) &&
      consumption.meats.every((name) => has('meats', name))
    );
  }

  private persist(state: InventoryState) {
    this.inventory.set(state);
    this.storage()?.setItem(this.key, JSON.stringify(state));
  }

  private load(): InventoryState {
    const raw = this.storage()?.getItem(this.key) ?? null;
    if (raw) return JSON.parse(raw) as InventoryState;
    return {
      bases: [
        { id: 'thin', name: 'Thin Crust', stock: 50, threshold: 20 },
        { id: 'hand', name: 'Hand Tossed', stock: 45, threshold: 20 },
        { id: 'cheese', name: 'Cheese Burst', stock: 30, threshold: 15 },
        { id: 'multigrain', name: 'Multigrain', stock: 35, threshold: 15 },
        { id: 'glutenfree', name: 'Gluten Free', stock: 20, threshold: 10 }
      ],
      sauces: [
        { id: 'marinara', name: 'Marinara', stock: 60, threshold: 25 },
        { id: 'pesto', name: 'Pesto', stock: 40, threshold: 15 },
        { id: 'bbq', name: 'BBQ', stock: 35, threshold: 15 },
        { id: 'alfredo', name: 'Alfredo', stock: 30, threshold: 12 },
        { id: 'arrabiata', name: 'Arrabbiata', stock: 30, threshold: 12 }
      ],
      cheeses: [
        { id: 'mozz', name: 'Mozzarella', stock: 70, threshold: 25 },
        { id: 'cheddar', name: 'Cheddar', stock: 50, threshold: 20 },
        { id: 'feta', name: 'Feta', stock: 25, threshold: 10 },
        { id: 'parm', name: 'Parmesan', stock: 30, threshold: 10 },
        { id: 'vegan', name: 'Vegan', stock: 20, threshold: 8 }
      ],
      veggies: [
        { id: 'pepper', name: 'Bell Peppers', stock: 80, threshold: 25 },
        { id: 'onion', name: 'Red Onions', stock: 80, threshold: 25 },
        { id: 'olive', name: 'Olives', stock: 60, threshold: 20 },
        { id: 'jalapeno', name: 'Jalapenos', stock: 50, threshold: 18 },
        { id: 'corn', name: 'Sweet Corn', stock: 70, threshold: 25 },
        { id: 'mushroom', name: 'Mushrooms', stock: 55, threshold: 18 },
        { id: 'spinach', name: 'Baby Spinach', stock: 40, threshold: 15 }
      ],
      meats: [
        { id: 'pepperoni', name: 'Pepperoni', stock: 60, threshold: 20 },
        { id: 'chicken', name: 'Grilled Chicken', stock: 55, threshold: 18 },
        { id: 'sausage', name: 'Italian Sausage', stock: 45, threshold: 15 },
        { id: 'bacon', name: 'Bacon', stock: 35, threshold: 12 },
        { id: 'meatless', name: 'Plant Meatballs', stock: 30, threshold: 12 }
      ]
    };
  }

  private storage(): Storage | null {
    const value = (globalThis as { localStorage?: Storage }).localStorage;
    return value && typeof value.getItem === 'function' ? value : null;
  }
}
