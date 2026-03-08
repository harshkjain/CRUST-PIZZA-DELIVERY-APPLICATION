import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-forgot',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-card">
      <p class="eyebrow">Reset password</p>
      <h2>Send reset code</h2>
      <form [formGroup]="form" (ngSubmit)="submit()" class="form">
        <label>
          <span>Email</span>
          <input type="email" formControlName="email" placeholder="you@example.com" />
        </label>
        <button class="btn primary" type="submit" [disabled]="form.invalid">Send code</button>
      </form>
      <p class="success" *ngIf="resetCode">Reset code (simulated email): <strong>{{ resetCode }}</strong></p>
      <div class="divider"></div>
      <h3>Update password</h3>
      <form [formGroup]="resetForm" (ngSubmit)="reset()" class="form">
        <label><span>Email</span><input type="email" formControlName="email" /></label>
        <label><span>Reset code</span><input type="text" formControlName="code" /></label>
        <label><span>New password</span><input type="password" formControlName="password" /></label>
        <button class="btn ghost" type="submit" [disabled]="resetForm.invalid">Change password</button>
      </form>
      <p class="error" *ngIf="error">{{ error }}</p>
      <p class="success" *ngIf="message">{{ message }}</p>
    </div>
  `,
  styles: [
    `
      .auth-card { max-width: 520px; margin: 2rem auto; padding: 2rem; border-radius: 1rem; border: 1px solid var(--border-soft); background: var(--surface); }
      .form { display: grid; gap: 0.75rem; margin: 1.2rem 0; }
      label { display: grid; gap: 0.35rem; color: var(--text-primary); font-weight: 600; }
      input { padding: 0.75rem 0.85rem; border-radius: 0.75rem; border: 1px solid var(--border-soft); background: var(--surface-raised); color: var(--text-primary); font-size: 1rem; }
      .btn.primary { background: linear-gradient(120deg, #ec4899, #f97316); color: white; border: none; padding: 0.85rem 1.25rem; border-radius: 0.8rem; font-weight: 700; cursor: pointer; }
      .btn.ghost { background: #0f172a; color: white; border: none; padding: 0.8rem 1.2rem; border-radius: 0.8rem; font-weight: 700; cursor: pointer; }
      .divider { height: 1px; background: #e2e8f0; margin: 1rem 0; }
      .eyebrow { font-size: 0.85rem; letter-spacing: 0.08em; color: #ec4899; text-transform: uppercase; }
      .success { color: #16a34a; }
      .error { color: #dc2626; }
    `
  ]
})
export class ForgotPasswordComponent {
  resetCode = '';
  error = '';
  message = '';
  private fb = inject(FormBuilder);
  form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
  resetForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    code: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  constructor(private auth: AuthService) {}

  submit() {
    this.error = '';
    const email = this.form.value.email;
    if (!email) return;
    const res = this.auth.requestPasswordReset(email);
    if (res.ok) this.resetCode = res.resetCode ?? '';
    else this.error = res.message;
  }

  reset() {
    this.error = '';
    this.message = '';
    const { email, code, password } = this.resetForm.value;
    if (!email || !code || !password) return;
    const res = this.auth.resetPassword(email, code, password);
    if (res.ok) this.message = res.message;
    else this.error = res.message;
  }
}
