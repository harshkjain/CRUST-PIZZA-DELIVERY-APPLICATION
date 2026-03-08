import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterModule],
  template: `
    <section class="hero card">
      <div class="brand-watermark" aria-hidden="true"></div>
      <div class="copy">
        <p class="eyebrow">Crust Pizza</p>
        <h1>Premium pizza delivery with bold flavor and modern ordering.</h1>
        <p class="lead">
          Handpick signature pizzas or craft your own, pay securely, and follow every order stage in real time.
        </p>
        <div class="cta-row">
          <a routerLink="/register" class="btn primary">Create user account</a>
          <a routerLink="/login" [queryParams]="{ role: 'user' }" class="btn ghost">User login</a>
          <a routerLink="/login" [queryParams]="{ role: 'admin' }" class="btn dark">Admin login</a>
        </div>
      </div>
      <div class="hero-photo"></div>
    </section>

    <section class="pizza-theme">
      <article class="card pic big one">
        <div class="overlay">
          <h3>Signature Collection</h3>
          <p>Handcrafted crusts with premium ingredients</p>
        </div>
      </article>

      <article class="card pic two"></article>
      <article class="card pic three"></article>
      <article class="card pic four"></article>
    </section>
  `,
  styles: [
    `
      .hero {
        display: grid;
        grid-template-columns: 1.15fr 1fr;
        gap: 1.1rem;
        align-items: center;
        position: relative;
        overflow: hidden;
      }
      .brand-watermark {
        position: absolute;
        top: 0.7rem;
        right: 0.8rem;
        width: 260px;
        height: 340px;
        background: url('/brand/crust-logo.svg') center/contain no-repeat;
        opacity: 0.18;
        filter: saturate(1.1);
        transform-origin: center;
        animation: mark-drift 9s ease-in-out infinite;
        pointer-events: none;
      }

      .card {
        background: var(--surface);
        border: 1px solid var(--border-soft);
        border-radius: 1rem;
        padding: 1.15rem;
      }
      .copy,
      .hero-photo {
        position: relative;
        z-index: 1;
      }

      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-weight: 700;
        color: var(--accent);
      }

      h1 {
        font-size: 2.2rem;
        margin: 0.35rem 0;
        line-height: 1.15;
      }

      .lead {
        color: var(--text-muted);
      }

      .cta-row {
        display: flex;
        gap: 0.7rem;
        margin: 1rem 0;
        flex-wrap: wrap;
      }

      .btn {
        padding: 0.74rem 1.1rem;
        border-radius: 0.8rem;
        font-weight: 700;
        text-decoration: none;
        border: 1px solid var(--border-soft);
        transition: transform var(--motion-fast), box-shadow var(--motion-fast);
      }

      .btn:active {
        transform: scale(0.97);
      }

      .btn:hover {
        box-shadow: 0 14px 24px rgba(0, 0, 0, 0.14);
      }

      .primary {
        background: linear-gradient(120deg, #f97316, #fb923c);
        color: #fff;
        border: none;
      }

      .ghost {
        background: var(--surface-raised);
      }

      .dark {
        background: #1f2937;
        color: #fff;
        border: none;
      }

      .hero-photo {
        min-height: 300px;
        border-radius: 1rem;
        border: 1px solid var(--border-soft);
        background:
          linear-gradient(135deg, rgba(0, 0, 0, 0.44), rgba(0, 0, 0, 0.14)),
          url('/brand/crust-logo.svg') right 1rem top 1rem / 160px 220px no-repeat,
          url('https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1300&q=80') center/cover;
        animation: hero-glow 6s ease-in-out infinite;
      }

      .pizza-theme {
        margin-top: 1rem;
        display: grid;
        grid-template-columns: 1.2fr 1fr 1fr;
        gap: 0.8rem;
      }

      .pic {
        min-height: 180px;
        padding: 0;
        overflow: hidden;
        position: relative;
        background-size: cover;
        background-position: center;
        transition: transform var(--motion-fast), box-shadow var(--motion-fast);
      }

      .pic:hover {
        transform: translateY(-4px);
        box-shadow: 0 18px 28px rgba(0, 0, 0, 0.2);
      }

      .big {
        grid-row: span 2;
        min-height: 370px;
      }

      .one {
        background-image:
          linear-gradient(160deg, rgba(0, 0, 0, 0.48), rgba(0, 0, 0, 0.16)),
          url('https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=1400&q=80');
      }

      .two {
        background-image:
          linear-gradient(160deg, rgba(0, 0, 0, 0.34), rgba(0, 0, 0, 0.1)),
          url('https://images.unsplash.com/photo-1593504049359-74330189a345?auto=format&fit=crop&w=1200&q=80');
      }

      .three {
        background-image:
          linear-gradient(160deg, rgba(0, 0, 0, 0.34), rgba(0, 0, 0, 0.1)),
          url('https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=1200&q=80');
      }

      .four {
        background-image:
          linear-gradient(160deg, rgba(0, 0, 0, 0.34), rgba(0, 0, 0, 0.1)),
          url('https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80');
      }

      .overlay {
        position: absolute;
        inset: auto 0 0 0;
        padding: 1rem;
        color: #fff;
        background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.65));
      }

      .overlay h3 {
        margin: 0;
      }

      .overlay p {
        margin: 0.35rem 0 0;
        color: #ffe4cf;
      }

      @media (max-width: 1080px) {
        .hero {
          grid-template-columns: 1fr;
        }
        .brand-watermark {
          width: 180px;
          height: 240px;
          opacity: 0.16;
          top: 0.75rem;
          right: 0.65rem;
        }

        .pizza-theme {
          grid-template-columns: 1fr 1fr;
        }

        .big {
          grid-column: span 2;
          min-height: 300px;
        }
      }

      @media (max-width: 760px) {
        h1 {
          font-size: 1.76rem;
        }
        .brand-watermark {
          width: 120px;
          height: 160px;
          top: 0.65rem;
          right: 0.6rem;
          opacity: 0.14;
        }

        .pizza-theme {
          grid-template-columns: 1fr;
        }

        .big {
          grid-column: auto;
        }
      }
      @keyframes mark-drift {
        0%, 100% { transform: translateY(0) rotate(-2deg); }
        50% { transform: translateY(-8px) rotate(2deg); }
      }
      @keyframes hero-glow {
        0%, 100% { box-shadow: 0 0 0 rgba(249, 115, 22, 0); }
        50% { box-shadow: 0 16px 34px rgba(249, 115, 22, 0.22); }
      }
    `
  ]
})
export class LandingComponent {}
