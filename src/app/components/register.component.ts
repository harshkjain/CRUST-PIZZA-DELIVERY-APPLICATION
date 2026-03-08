import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-card">
      <p class="eyebrow">Create account</p>
      <h2>Join Crust Pizza</h2>
      <p class="muted">Use at least 6 characters in password.</p>
      <form [formGroup]="form" (ngSubmit)="submit()" class="form">
        <label>
          <span>Full name</span>
          <input type="text" formControlName="name" placeholder="Jane Doe" />
        </label>
        <label>
          <span>Email</span>
          <input type="email" formControlName="email" placeholder="you@example.com" />
        </label>
        <label>
          <span>Password</span>
          <input type="password" formControlName="password" placeholder="Strong password" />
        </label>
        <button class="btn primary" type="submit" [disabled]="form.invalid">Create account</button>
      </form>
      <p class="success" *ngIf="verificationCode">Verification code (simulated email): <strong>{{ verificationCode }}</strong></p>
      <p class="error" *ngIf="error">{{ error }}</p>
      <a class="verify-link" routerLink="/verify" *ngIf="verificationCode">Go to email verification</a>
      <p class="muted">Already verified? <a routerLink="/login" class="link">Login</a></p>
    </div>
  `,
  styles: [
    `
      .auth-card { max-width: 520px; margin: 2rem auto; padding: 2rem; border-radius: 1rem; border: 1px solid var(--border-soft); background: var(--surface); animation: rise 380ms var(--motion-smooth); }
      .form { display: grid; gap: 1rem; margin: 1.2rem 0; }
      label { display: grid; gap: 0.35rem; color: var(--text-primary); font-weight: 600; }
      input { padding: 0.75rem 0.85rem; border-radius: 0.75rem; border: 1px solid var(--border-soft); background: var(--surface-raised); color: var(--text-primary); font-size: 1rem; }
      .btn.primary { background: linear-gradient(120deg, #22c55e, #16a34a); color: white; border: none; padding: 0.85rem 1.25rem; border-radius: 0.8rem; font-weight: 700; cursor: pointer; transition: transform var(--motion-fast), box-shadow var(--motion-fast); }
      .btn.primary:hover { box-shadow: 0 14px 24px rgba(22, 163, 74, 0.24); }
      .btn.primary:active { transform: scale(0.97); }
      .success { color: #16a34a; margin-top: 0.5rem; }
      .error { color: #dc2626; margin-top: 0.5rem; }
      .muted { color: var(--text-muted); }
      .eyebrow { font-size: 0.85rem; letter-spacing: 0.08em; color: #22c55e; text-transform: uppercase; }
      h2 { margin: 0.3rem 0; }
      .link { color: #2563eb; text-decoration: none; }
      .verify-link { display: inline-flex; margin-top: 0.25rem; color: #16a34a; font-weight: 700; text-decoration: none; }
      @keyframes rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    `
  ]
})
export class RegisterComponent {
  verificationCode = '';
  error = '';
  private fb = inject(FormBuilder);
  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor(private auth: AuthService) {}

  submit() {
    this.error = '';
    this.verificationCode = '';
    const { name, email, password } = this.form.value;
    if (!name || !email || !password) return;
    const res = this.auth.register({ name, email, password, role: 'user' });
    if (res.ok) {
      this.verificationCode = res.verificationCode ?? '';
      this.form.reset();
      return;
    }
    this.error = res.message;
  }
}
