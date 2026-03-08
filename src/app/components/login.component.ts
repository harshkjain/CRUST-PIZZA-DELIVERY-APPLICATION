import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-shell">
      <section class="brand-panel" [style.background-image]="heroBackground()">
        <div class="brand-watermark" aria-hidden="true"></div>
        <p class="eyebrow">Crust Pizza</p>
        <h2>{{ mode === 'admin' ? 'Admin login' : 'Welcome back to your pizza world' }}</h2>
        <p>Fast, premium and animated experience designed for your brand.</p>
        <div class="glass-strip" aria-hidden="true">
          <span class="thumb t1"></span>
          <span class="thumb t2"></span>
          <span class="thumb t3"></span>
        </div>
      </section>

      <section class="auth-card">
        <div class="header">
          <p class="eyebrow">Secure Access</p>
          <h3>{{ mode === 'admin' ? 'Admin sign in' : 'User sign in' }}</h3>
          <p class="muted">Use your verified email to continue.</p>
        </div>
        <form [formGroup]="form" (ngSubmit)="submit()" class="form">
          <label>
            <span>Email</span>
            <input type="email" formControlName="email" placeholder="you@example.com" />
          </label>
          <label>
            <span>Password</span>
            <input type="password" formControlName="password" placeholder="********" />
          </label>
          <div class="actions">
            <button type="submit" class="btn primary" [disabled]="form.invalid">Log in</button>
            <a routerLink="/forgot" class="link">Forgot password?</a>
          </div>
          <p class="error" *ngIf="error">{{ error }}</p>
          <p class="success" *ngIf="message">{{ message }}</p>
        </form>
        <p class="muted" *ngIf="mode === 'admin'">Admin demo: admin@pizza.com / Admin@123</p>
        <p class="muted" *ngIf="mode === 'user'">User demo: user@pizza.com / User@123</p>
        <p class="muted">
          No account? <a routerLink="/register" class="link">Create one</a>
        </p>
      </section>
    </div>
  `,
  styles: [
    `
      .auth-shell { max-width: 980px; margin: 2rem auto; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
      .brand-panel {
        border: 1px solid #ffffff2f;
        border-radius: 1rem;
        background-size: cover;
        background-position: center;
        color: #fff;
        padding: 1.3rem;
        position: relative;
        overflow: hidden;
        animation: rise 380ms var(--motion-smooth);
      }
      .brand-panel::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(145deg, rgba(15, 23, 42, 0.78), rgba(2, 6, 23, 0.62));
      }
      .brand-panel::after {
        content: '';
        position: absolute;
        inset: 0;
        background:
          url('/brand/crust-logo.svg') left 0.8rem top 0.8rem / 150px 200px no-repeat,
          url('/brand/crust-logo.svg') right 0.9rem bottom 0.7rem / 130px 170px no-repeat;
        opacity: 0.18;
        animation: watermark-shift 9s ease-in-out infinite;
      }
      .brand-watermark {
        position: absolute;
        width: 140px;
        height: 185px;
        right: 1.1rem;
        top: 0.95rem;
        background: url('/brand/crust-logo.svg') center/contain no-repeat;
        opacity: 0.3;
        filter: drop-shadow(0 8px 14px rgba(0, 0, 0, 0.32));
        animation: logo-float 4.8s ease-in-out infinite;
      }
      .brand-panel > * { position: relative; z-index: 1; }
      .brand-panel h2 { margin: 0.45rem 0; font-size: 2rem; line-height: 1.1; }
      .brand-panel p { color: #cbd5e1; }

      .glass-strip {
        margin-top: 1.1rem;
        padding: 0.5rem;
        border-radius: 0.8rem;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.45rem;
        background: rgba(255, 255, 255, 0.13);
        backdrop-filter: blur(6px);
      }
      .thumb {
        height: 72px;
        border-radius: 0.6rem;
        background-size: cover;
        background-position: center;
        border: 1px solid rgba(255, 255, 255, 0.32);
        animation: float 4.4s ease-in-out infinite;
      }
      .t1 { background-image: url('https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80'); }
      .t2 { background-image: url('https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=700&q=80'); animation-delay: 240ms; }
      .t3 { background-image: url('https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=700&q=80'); animation-delay: 460ms; }

      .auth-card { padding: 1.2rem; border-radius: 1rem; border: 1px solid var(--border-soft); background: var(--surface); animation: rise 420ms var(--motion-smooth); }
      .header h3 { margin: 0.2rem 0 0.5rem; font-size: 1.7rem; }
      .eyebrow { font-size: 0.85rem; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; font-weight: 700; }
      .muted { color: var(--text-muted); }
      .form { display: grid; gap: 1rem; margin: 1rem 0; }
      label { display: grid; gap: 0.35rem; color: var(--text-primary); font-weight: 600; }
      input { padding: 0.85rem 0.9rem; border-radius: 0.75rem; border: 1px solid var(--border-soft); background: var(--surface-raised); color: var(--text-primary); font-size: 1rem; transition: border-color var(--motion-fast), box-shadow var(--motion-fast); }
      input:focus { border-color: #fb923c; box-shadow: 0 0 0 3px rgba(249,115,22,0.2); }
      .actions { display: flex; align-items: center; justify-content: space-between; }
      .btn.primary { background: linear-gradient(120deg, #f97316, #fb923c); color: white; border: none; padding: 0.8rem 1.3rem; border-radius: 0.8rem; font-weight: 700; cursor: pointer; transition: transform var(--motion-fast), box-shadow var(--motion-fast); }
      .btn.primary:hover { box-shadow: 0 14px 26px rgba(249,115,22,0.25); }
      .btn.primary:active { transform: scale(0.97); }
      .btn[disabled] { opacity: 0.6; cursor: not-allowed; }
      .link { color: #2563eb; text-decoration: none; }
      .error { color: #dc2626; }
      .success { color: #16a34a; }
      @keyframes logo-float { 0%,100%{ transform: translateY(0); } 50%{ transform: translateY(-5px); } }
      @keyframes watermark-shift { 0%,100%{ transform: translateX(0); } 50%{ transform: translateX(-6px); } }
      @keyframes float { 0%,100%{ transform: translateY(0); } 50%{ transform: translateY(-5px); } }
      @keyframes rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      @media (max-width: 860px) { .auth-shell { grid-template-columns: 1fr; } }
    `
  ]
})
export class LoginComponent {
  mode: 'admin' | 'user' = 'user';
  error = '';
  message = '';
  private fb = inject(FormBuilder);
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.mode = this.route.snapshot.queryParamMap.get('role') === 'admin' ? 'admin' : 'user';
  }

  heroBackground() {
    const admin =
      "linear-gradient(145deg, rgba(15,23,42,0.45), rgba(15,23,42,0.74)), url('https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1400&q=80')";
    const user =
      "linear-gradient(145deg, rgba(15,23,42,0.45), rgba(15,23,42,0.74)), url('https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=1400&q=80')";
    return this.mode === 'admin' ? admin : user;
  }

  submit() {
    this.error = '';
    this.message = '';
    const { email, password } = this.form.value;
    if (!email || !password) return;
    const res = this.auth.login(email, password);
    if (!res.ok) {
      this.error = res.message;
      return;
    }
    this.message = res.message;
    const role = res.user?.role;
    setTimeout(() => {
      this.router.navigate([role === 'admin' ? '/admin' : '/user']);
    }, 400);
  }
}
