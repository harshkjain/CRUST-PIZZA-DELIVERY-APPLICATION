import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CheckoutService } from '../services/checkout.service';
import { InventoryService } from '../services/inventory.service';
import { PizzaAddOnSelection, PizzaSelection } from '../services/order.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="shell">
      <section class="hero card">
        <div>
          <div class="hero-brand">
            <img src="/brand/crust-logo.svg" alt="Crust Pizza logo" />
            <span>Original Crust Pizza</span>
          </div>
          <p class="eyebrow">Crust Pizza User Zone</p>
          <h2>Hello, {{ auth.currentUser()?.name }}</h2>
          <p class="muted">Create your pizza and enjoy smooth payments with premium animations.</p>
          <div class="hero-actions">
            <a class="btn ghost" routerLink="/orders">Order history</a>
            <button class="btn" (click)="logout()">Logout</button>
          </div>
        </div>
        <div class="hero-photo"></div>
      </section>

      <section class="card">
        <div class="head-row">
          <h3>Trending pizzas</h3>
          <p class="muted">Premium picks inspired by top delivery brands</p>
        </div>
        <div class="selected-banner" *ngIf="selectedTrending()">
          <p>
            Selected pizza: <strong>{{ selectedTrending()!.name }}</strong> at INR
            {{ selectedTrending()!.price }}
          </p>
          <button class="btn ghost small" (click)="clearSelectedPizza()">Remove selected pizza</button>
        </div>
        <div class="pizza-grid">
          <article
            class="pizza"
            [class.is-selected]="selectedTrending()?.name === pizza.name"
            *ngFor="let pizza of featuredPizzas; let i = index"
            [style.animation-delay.ms]="i * 60"
          >
            <div class="photo" [style.background-image]="'linear-gradient(145deg, rgba(0,0,0,0.36), rgba(0,0,0,0.1)), url(' + pizza.image + ')'">
              <span>INR {{ pizza.price }}</span>
            </div>
            <h4>{{ pizza.name }}</h4>
            <p>{{ pizza.desc }}</p>
            <button class="pick-btn" [class.selected]="selectedTrending()?.name === pizza.name" (click)="chooseTrending(pizza)">
              {{ selectedTrending()?.name === pizza.name ? 'Selected (Tap to remove)' : 'Choose this pizza' }}
            </button>
          </article>
        </div>
      </section>

      <section class="card highlight">
        <div class="build-head">
          <h3>Build your custom pizza</h3>
          <p class="muted">Choose ingredients and complete payment in one premium flow.</p>
          <button class="btn ghost small" (click)="startCustom()">Start Custom</button>
        </div>

        <div class="step-grid">
          <div class="stage">
            <h4><span>1</span> Choose pizza base</h4>
            <div class="chips">
              <button
                *ngFor="let base of inventory().bases"
                class="chip"
                [class.active]="selection.base() === base.name"
                [disabled]="base.stock === 0"
                (click)="selection.base.set(base.name)"
              >
                {{ base.name }}
              </button>
            </div>
          </div>

          <div class="stage">
            <h4><span>2</span> Choose sauce</h4>
            <div class="chips">
              <button
                *ngFor="let sauce of inventory().sauces"
                class="chip"
                [class.active]="selection.sauce() === sauce.name"
                [disabled]="sauce.stock === 0"
                (click)="selection.sauce.set(sauce.name)"
              >
                {{ sauce.name }}
              </button>
            </div>
          </div>

          <div class="stage">
            <h4><span>3</span> Select cheese</h4>
            <div class="chips">
              <button
                *ngFor="let cheese of inventory().cheeses"
                class="chip"
                [class.active]="selection.cheese() === cheese.name"
                [disabled]="cheese.stock === 0"
                (click)="selection.cheese.set(cheese.name)"
              >
                {{ cheese.name }}
              </button>
            </div>
          </div>

          <div class="stage">
            <h4><span>4</span> Pick veggies</h4>
            <div class="chips">
              <button
                *ngFor="let veg of inventory().veggies"
                class="chip"
                [class.active]="selection.veggies().has(veg.name)"
                [disabled]="veg.stock === 0"
                (click)="toggleVeg(veg.name)"
              >
                {{ veg.name }}
              </button>
            </div>
          </div>

          <div class="stage">
            <h4><span>5</span> Add meat (optional)</h4>
            <div class="chips">
              <button
                *ngFor="let meat of inventory().meats"
                class="chip"
                [class.active]="selection.meats().has(meat.name)"
                [disabled]="meat.stock === 0"
                (click)="toggleMeat(meat.name)"
              >
                {{ meat.name }}
              </button>
            </div>
          </div>

          <div class="stage addons">
            <h4><span>6</span> Add-on toppings</h4>
            <p class="muted">Pick as many premium add-ons as you like.</p>
            <div class="chips">
              <button
                *ngFor="let addon of addOnCatalog"
                class="chip addon-chip"
                [class.active]="selection.addOns().has(addon.name)"
                (click)="toggleAddOn(addon.name)"
              >
                <span>{{ addon.name }}</span>
                <strong>+ INR {{ addon.price }}</strong>
              </button>
            </div>
          </div>
        </div>

        <div class="summary">
          <div>
            <p class="muted" *ngIf="selectedTrending()">Selected: {{ selectedTrending()!.name }} (INR {{ selectedTrending()!.price }})</p>
            <p class="muted" *ngIf="!selectedTrending()">Custom pizza starts at INR {{ basePrice }}</p>
            <p class="muted" *ngIf="selectedAddOnsSummary().length">Add-ons: {{ selectedAddOnsSummary() }}</p>
            <h3>Total: INR {{ total() }}</h3>
          </div>
          <div class="actions">
            <button class="btn primary" (click)="proceedToPayment()">Proceed to payment</button>
            <p class="error" *ngIf="error">{{ error }}</p>
            <p class="success" *ngIf="message">{{ message }}</p>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      .shell { padding: 1.2rem; display: grid; gap: 1rem; }
      .card { background: var(--surface); border: 1px solid var(--border-soft); border-radius: 1rem; padding: 1.1rem; animation: rise 420ms var(--motion-smooth); }
      .hero { display: grid; grid-template-columns: 1fr 360px; gap: 1rem; align-items: center; }
      .hero-brand {
        display: inline-flex;
        align-items: center;
        gap: 0.55rem;
        margin-bottom: 0.35rem;
        padding: 0.28rem 0.5rem 0.28rem 0.3rem;
        border-radius: 999px;
        border: 1px solid var(--border-soft);
        background: linear-gradient(120deg, rgba(249, 115, 22, 0.1), rgba(2, 132, 199, 0.1));
        animation: fade-in 320ms var(--motion-smooth);
      }
      .hero-brand img {
        width: 1.7rem;
        height: 2.2rem;
        border-radius: 0.55rem;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
      }
      .hero-brand span { font-weight: 700; font-size: 0.86rem; color: var(--text-primary); }
      .hero-photo {
        border-radius: 0.95rem;
        min-height: 210px;
        border: 1px solid var(--border-soft);
        background: linear-gradient(130deg, rgba(0, 0, 0, 0.34), rgba(0, 0, 0, 0.1)),
          url('https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=1200&q=80') center/cover;
      }
      .hero-actions { display: flex; gap: 0.6rem; }
      .head-row { display: flex; align-items: center; justify-content: space-between; gap: 0.8rem; }
      .selected-banner {
        margin-top: 0.7rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.8rem;
        border: 1px solid var(--border-soft);
        border-radius: 0.75rem;
        background: linear-gradient(120deg, rgba(251, 146, 60, 0.12), rgba(14, 165, 233, 0.08));
        padding: 0.55rem 0.7rem;
        animation: fade-in 300ms var(--motion-smooth);
      }
      .selected-banner p { margin: 0; color: var(--text-primary); }
      .pizza-grid { margin-top: 0.8rem; display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; }
      .pizza {
        background: var(--surface-raised);
        border: 1px solid var(--border-soft);
        border-radius: 0.9rem;
        overflow: hidden;
        transition: transform var(--motion-fast), box-shadow var(--motion-fast);
        animation: pizza-in 420ms var(--motion-smooth) both;
      }
      .pizza.is-selected {
        border-color: #fb923c;
        box-shadow: 0 0 0 2px rgba(251, 146, 60, 0.25);
      }
      .pizza:hover { transform: translateY(-5px); box-shadow: 0 16px 26px rgba(0, 0, 0, 0.18); }
      .pizza .photo { min-height: 92px; padding: 0.5rem; display: flex; justify-content: flex-end; align-items: flex-start; background-size: cover; background-position: center; }
      .pizza .photo span { background: rgba(0, 0, 0, 0.65); color: #fff; border-radius: 999px; padding: 0.2rem 0.5rem; font-size: 0.76rem; }
      .pizza h4,.pizza p { margin: 0; padding: 0.55rem 0.65rem; }
      .pizza p { color: var(--text-muted); padding-top: 0; font-size: 0.88rem; }
      .pick-btn {
        margin: 0 0.65rem 0.65rem;
        width: calc(100% - 1.3rem);
        border: 1px solid var(--border-soft);
        background: var(--surface);
        border-radius: 0.65rem;
        padding: 0.52rem 0.65rem;
        font-weight: 700;
        color: var(--text-primary);
        cursor: pointer;
        transition: transform var(--motion-fast), background var(--motion-fast), color var(--motion-fast), box-shadow var(--motion-fast);
      }
      .pick-btn:hover { box-shadow: 0 8px 16px rgba(0, 0, 0, 0.14); }
      .pick-btn.selected {
        background: linear-gradient(120deg, #f97316, #fb923c);
        color: #fff;
        border: none;
      }
      .highlight {
        box-shadow: 0 16px 32px rgba(249, 115, 22, 0.18);
        background:
          radial-gradient(circle at 4% 6%, rgba(251, 146, 60, 0.12), transparent 24%),
          radial-gradient(circle at 96% 8%, rgba(14, 165, 233, 0.09), transparent 28%),
          var(--surface);
      }
      .build-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 0.8rem; }
      .step-grid { display: grid; gap: 0.9rem; grid-template-columns: 1fr 1fr; }
      .stage {
        border: 1px solid var(--border-soft);
        border-radius: 0.85rem;
        padding: 0.75rem;
        background: rgba(255, 255, 255, 0.35);
        animation: rise 420ms var(--motion-smooth);
      }
      .stage h4 { margin: 0 0 0.55rem; display: flex; align-items: center; gap: 0.5rem; }
      .stage h4 span {
        width: 1.5rem;
        height: 1.5rem;
        border-radius: 50%;
        display: grid;
        place-items: center;
        background: linear-gradient(120deg, #f97316, #fb923c);
        color: white;
        font-size: 0.78rem;
      }
      .chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
      .chip {
        border: 1px solid var(--border-soft);
        background: var(--surface-raised);
        padding: 0.58rem 0.8rem;
        border-radius: 0.75rem;
        cursor: pointer;
        min-width: 138px;
        text-align: left;
        color: var(--text-primary);
        transition: transform var(--motion-fast), background var(--motion-fast), color var(--motion-fast), box-shadow var(--motion-fast);
      }
      .chip.active { background: var(--accent); color: #fff; border-color: transparent; box-shadow: 0 10px 18px rgba(231, 111, 23, 0.35); }
      .chip:disabled { opacity: 0.45; cursor: not-allowed; }
      .chip:active { transform: scale(0.97); }
      .addon-chip { display: flex; align-items: center; justify-content: space-between; min-width: 180px; gap: 0.6rem; }
      .addon-chip strong { font-size: 0.8rem; }

      .summary { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-top: 1rem; padding-top: 0.8rem; border-top: 1px solid var(--border-soft); }
      .btn { border: 1px solid var(--border-soft); background: #1f2937; color: #fff; padding: 0.7rem 1rem; border-radius: 0.8rem; cursor: pointer; transition: transform var(--motion-fast), box-shadow var(--motion-fast), opacity var(--motion-fast); }
      .btn.primary { background: linear-gradient(120deg, #fb923c, #f97316); border: none; }
      .btn.ghost { background: var(--surface-raised); color: var(--text-primary); text-decoration: none; }
      .btn.small { padding: 0.5rem 0.75rem; font-size: 0.86rem; }
      .btn:hover { box-shadow: 0 10px 18px rgba(0, 0, 0, 0.14); }
      .btn:active { transform: scale(0.97); }
      .error { color: #dc2626; }
      .success { color: #16a34a; }
      .muted { color: var(--text-muted); }
      .eyebrow { text-transform: uppercase; letter-spacing: 0.08em; color: var(--accent); font-weight: 700; }

      @keyframes rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes pizza-in { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      @keyframes fade-in { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }

      @media (max-width: 1100px) {
        .pizza-grid { grid-template-columns: repeat(3, 1fr); }
        .hero { grid-template-columns: 1fr; }
      }
      @media (max-width: 760px) {
        .selected-banner { flex-direction: column; align-items: flex-start; }
        .pizza-grid { grid-template-columns: repeat(2, 1fr); }
        .summary { flex-direction: column; align-items: flex-start; }
        .step-grid { grid-template-columns: 1fr; }
      }
      @media (max-width: 520px) { .pizza-grid { grid-template-columns: 1fr; } }
    `
  ]
})
export class UserDashboardComponent {
  featuredPizzas: FeaturedPizza[] = [
    {
      name: 'Truffle Mushroom',
      desc: 'Roasted mushrooms, caramelized onion and truffle drizzle',
      price: 399,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80',
      preset: {
        base: 'Thin Crust',
        sauce: 'Marinara',
        cheese: 'Mozzarella',
        veggies: ['Mushrooms', 'Red Onions'],
        meats: []
      }
    },
    {
      name: 'Spicy Arrabbiata',
      desc: 'Hot chili marinara, jalapeno and parmesan burst',
      price: 359,
      image: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=900&q=80',
      preset: {
        base: 'Hand Tossed',
        sauce: 'Arrabbiata',
        cheese: 'Parmesan',
        veggies: ['Jalapenos'],
        meats: []
      }
    },
    {
      name: 'BBQ Chicken Supreme',
      desc: 'BBQ glaze, smoky chicken, onion and cheddar',
      price: 429,
      image: 'https://images.unsplash.com/photo-1593504049359-74330189a345?auto=format&fit=crop&w=900&q=80',
      preset: {
        base: 'Cheese Burst',
        sauce: 'BBQ',
        cheese: 'Cheddar',
        veggies: ['Red Onions'],
        meats: ['Grilled Chicken']
      }
    },
    {
      name: 'Pesto Veggie Delight',
      desc: 'Fresh basil pesto, corn, olives, mushroom',
      price: 379,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80',
      preset: {
        base: 'Multigrain',
        sauce: 'Pesto',
        cheese: 'Mozzarella',
        veggies: ['Sweet Corn', 'Olives', 'Mushrooms'],
        meats: []
      }
    },
    {
      name: 'Mediterranean Melt',
      desc: 'Feta, olives, spinach and roasted peppers',
      price: 409,
      image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=900&q=80',
      preset: {
        base: 'Thin Crust',
        sauce: 'Marinara',
        cheese: 'Feta',
        veggies: ['Olives', 'Baby Spinach', 'Bell Peppers'],
        meats: []
      }
    },
    {
      name: 'Double Cheese Burst',
      desc: 'Loaded mozzarella, cheddar and creamy cheese sauce',
      price: 449,
      image: 'https://images.unsplash.com/photo-1595708684082-a173bb3a06c5?auto=format&fit=crop&w=900&q=80',
      preset: {
        base: 'Cheese Burst',
        sauce: 'Alfredo',
        cheese: 'Mozzarella',
        veggies: ['Sweet Corn'],
        meats: []
      }
    },
    {
      name: 'Smoky Paneer Tikka',
      desc: 'Tandoori paneer, onion and capsicum on spicy base',
      price: 429,
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=80',
      preset: {
        base: 'Hand Tossed',
        sauce: 'Arrabbiata',
        cheese: 'Cheddar',
        veggies: ['Bell Peppers', 'Red Onions'],
        meats: []
      }
    },
    {
      name: 'Farmhouse Classic',
      desc: 'Onion, tomato, mushroom and herbed mozzarella',
      price: 389,
      image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=900&q=80',
      preset: {
        base: 'Hand Tossed',
        sauce: 'Marinara',
        cheese: 'Mozzarella',
        veggies: ['Red Onions', 'Mushrooms', 'Bell Peppers'],
        meats: []
      }
    },
    {
      name: 'Pepperoni Blaze',
      desc: 'Pepperoni, chili flakes and hot marinara',
      price: 469,
      image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=900&q=80',
      preset: {
        base: 'Thin Crust',
        sauce: 'Marinara',
        cheese: 'Mozzarella',
        veggies: ['Jalapenos'],
        meats: ['Pepperoni']
      }
    }
  ];

  basePrice = 249;
  error = '';
  message = '';
  selectedTrending = signal<FeaturedPizza | null>(null);
  addOnCatalog: PizzaAddOnSelection[] = [
    { name: 'Extra Cheese', price: 45 },
    { name: 'Stuffed Crust Ring', price: 60 },
    { name: 'Cheese Dip', price: 35 },
    { name: 'Peri Peri Sprinkle', price: 20 },
    { name: 'Garlic Butter Drizzle', price: 30 },
    { name: 'Roasted Paneer Cubes', price: 55 },
    { name: 'Smoked Chicken Bites', price: 65 },
    { name: 'Jalapeno Burst', price: 25 }
  ];

  selection = {
    base: signal<string | null>(null),
    sauce: signal<string | null>(null),
    cheese: signal<string | null>(null),
    veggies: signal<Set<string>>(new Set()),
    meats: signal<Set<string>>(new Set()),
    addOns: signal<Set<string>>(new Set())
  };

  inventory = computed(() => this.inventoryService.inventory());

  constructor(
    public auth: AuthService,
    private inventoryService: InventoryService,
    private checkout: CheckoutService,
    private router: Router
  ) {}

  addOnTotal = computed(() =>
    [...this.selection.addOns()].reduce((sum, name) => {
      const match = this.addOnCatalog.find((addon) => addon.name === name);
      return sum + (match?.price ?? 0);
    }, 0)
  );

  selectedAddOnsSummary = computed(() =>
    [...this.selection.addOns()]
      .map((name) => {
        const match = this.addOnCatalog.find((addon) => addon.name === name);
        return match ? `${match.name} (+INR ${match.price})` : null;
      })
      .filter((value): value is string => Boolean(value))
      .join(' | ')
  );

  total = computed(() => {
    const selected = this.selectedTrending();
    if (selected) {
      return Math.max(0, selected.price + this.addOnTotal());
    }
    return this.basePrice + this.addOnTotal();
  });

  chooseTrending(pizza: FeaturedPizza) {
    if (this.selectedTrending()?.name === pizza.name) {
      this.clearSelectedPizza();
      return;
    }
    this.selectedTrending.set(pizza);
    this.selection.base.set(pizza.preset.base);
    this.selection.sauce.set(pizza.preset.sauce);
    this.selection.cheese.set(pizza.preset.cheese);
    this.selection.veggies.set(new Set(pizza.preset.veggies));
    this.selection.meats.set(new Set(pizza.preset.meats));
    this.selection.addOns.set(new Set(pizza.preset.addOns?.map((addon) => addon.name) ?? []));
  }

  startCustom() {
    this.clearSelectedPizza();
    this.resetSelection();
  }

  clearSelectedPizza() {
    this.selectedTrending.set(null);
  }

  toggleVeg(name: string) {
    const set = new Set(this.selection.veggies());
    set.has(name) ? set.delete(name) : set.add(name);
    this.selection.veggies.set(set);
  }

  toggleMeat(name: string) {
    const set = new Set(this.selection.meats());
    set.has(name) ? set.delete(name) : set.add(name);
    this.selection.meats.set(set);
  }

  toggleAddOn(name: string) {
    const set = new Set(this.selection.addOns());
    set.has(name) ? set.delete(name) : set.add(name);
    this.selection.addOns.set(set);
  }

  proceedToPayment() {
    this.error = '';
    this.message = '';

    const base = this.selection.base();
    const sauce = this.selection.sauce();
    const cheese = this.selection.cheese();

    if (!base || !sauce || !cheese) {
      this.error = 'Please choose base, sauce, and cheese.';
      return;
    }

    const selections: PizzaSelection = {
      base,
      sauce,
      cheese,
      veggies: [...this.selection.veggies()],
      meats: [...this.selection.meats()],
      addOns: [...this.selection.addOns()]
        .map((name) => this.addOnCatalog.find((addon) => addon.name === name))
        .filter((addon): addon is PizzaAddOnSelection => Boolean(addon))
    };

    if (!this.inventoryService.canFulfill(selections)) {
      this.error = 'Some selected items are unavailable right now. Please change your selection.';
      return;
    }

    this.checkout.setDraft({
      total: this.total(),
      selection: selections
    });
    this.router.navigate(['/payment']);
  }

  resetSelection() {
    this.selection.base.set(null);
    this.selection.sauce.set(null);
    this.selection.cheese.set(null);
    this.selection.veggies.set(new Set());
    this.selection.meats.set(new Set());
    this.selection.addOns.set(new Set());
    this.selectedTrending.set(null);
  }

  logout() {
    this.auth.logout();
  }
}

interface FeaturedPizza {
  name: string;
  desc: string;
  price: number;
  image: string;
  preset: PizzaSelection;
}
