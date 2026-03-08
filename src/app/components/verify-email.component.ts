import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-card">
      <p class="eyebrow">Verify email</p>
      <h2>Enter the 6-digit code</h2>
      <form [formGroup]="form" (ngSubmit)="submit()" class="form">
        <label>
          <span>Email</span>
          <input type="email" formControlName="email" placeholder="you@example.com" />
        </label>
        <label>
          <span>Verification code</span>
          <input type="text" formControlName="code" placeholder="123456" />
        </label>
        <button class="btn primary" type="submit" [disabled]="form.invalid">Verify</button>
      </form>
      <p class="success" *ngIf="message">{{ message }}</p>
      <p class="error" *ngIf="error">{{ error }}</p>
    </div>
  `,
  styles: [
    `
      .auth-card { max-width: 520px; margin: 2rem auto; padding: 2rem; border-radius: 1rem; border: 1px solid var(--border-soft); background: var(--surface); }
      .form { display: grid; gap: 1rem; margin: 1.2rem 0; }
      label { display: grid; gap: 0.35rem; color: var(--text-primary); font-weight: 600; }
      input { padding: 0.75rem 0.85rem; border-radius: 0.75rem; border: 1px solid var(--border-soft); background: var(--surface-raised); color: var(--text-primary); font-size: 1rem; }
      .btn.primary { background: linear-gradient(120deg, #38bdf8, #0ea5e9); color: white; border: none; padding: 0.85rem 1.25rem; border-radius: 0.8rem; font-weight: 700; cursor: pointer; }
      .success { color: #16a34a; }
      .error { color: #dc2626; }
      .eyebrow { font-size: 0.85rem; letter-spacing: 0.08em; color: #38bdf8; text-transform: uppercase; }
    `
  ]
})
export class VerifyEmailComponent {
  message = '';
  error = '';
  private fb = inject(FormBuilder);
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    code: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor(private auth: AuthService) {}

  submit() {
    this.message = '';
    this.error = '';
    const { email, code } = this.form.value;
    if (!email || !code) return;
    const res = this.auth.verifyEmail(email, code);
    if (res.ok) this.message = res.message;
    else this.error = res.message;
  }
}
