import { Injectable, signal } from '@angular/core';

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  verified: boolean;
  verificationCode?: string;
  resetCode?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly usersKey = 'pizza_users';
  private readonly sessionKey = 'pizza_session';
  readonly users = signal<User[]>([]);
  readonly currentUser = signal<User | null>(null);

  constructor() {
    const cachedUsers = this.loadUsers();
    if (!cachedUsers.length) {
      cachedUsers.push({
        id: crypto.randomUUID(),
        name: 'Admin',
        email: 'admin@pizza.com',
        password: 'Admin@123',
        role: 'admin',
        verified: true
      });
      cachedUsers.push({
        id: crypto.randomUUID(),
        name: 'Demo User',
        email: 'user@pizza.com',
        password: 'User@123',
        role: 'user',
        verified: true
      });
      this.persistUsers(cachedUsers);
    }
    this.users.set(this.loadUsers());
    this.currentUser.set(this.loadSession());
  }

  register(payload: { name: string; email: string; password: string; role?: UserRole }) {
    const existing = this.users().find((u) => u.email.toLowerCase() === payload.email.toLowerCase());
    if (existing) {
      return { ok: false, message: 'Account already exists for this email.' };
    }
    const verificationCode = this.generateCode();
    const user: User = {
      id: crypto.randomUUID(),
      name: payload.name,
      email: payload.email.toLowerCase(),
      password: payload.password,
      role: payload.role ?? 'user',
      verified: false,
      verificationCode
    };
    const updated = [...this.users(), user];
    this.persistUsers(updated);
    this.users.set(updated);
    return { ok: true, message: 'Registered. Please verify your email.', verificationCode };
  }

  verifyEmail(email: string, code: string) {
    const users = [...this.users()];
    const idx = users.findIndex((u) => u.email === email.toLowerCase());
    if (idx === -1) return { ok: false, message: 'User not found.' };
    if (users[idx].verified) return { ok: true, message: 'Email already verified.' };
    if (users[idx].verificationCode !== code) return { ok: false, message: 'Invalid code.' };
    users[idx] = { ...users[idx], verified: true, verificationCode: undefined };
    this.persistUsers(users);
    this.users.set(users);
    return { ok: true, message: 'Email verified. You can log in now.' };
  }

  login(email: string, password: string) {
    const user = this.users().find((u) => u.email === email.toLowerCase() && u.password === password);
    if (!user) return { ok: false, message: 'Invalid credentials.' };
    if (!user.verified) return { ok: false, message: 'Please verify your email first.' };
    this.currentUser.set(user);
    this.storage()?.setItem(this.sessionKey, JSON.stringify(user));
    return { ok: true, message: 'Login successful', user };
  }

  logout() {
    this.currentUser.set(null);
    this.storage()?.removeItem(this.sessionKey);
  }

  requestPasswordReset(email: string) {
    const users = [...this.users()];
    const idx = users.findIndex((u) => u.email === email.toLowerCase());
    if (idx === -1) return { ok: false, message: 'No account found.' };
    const resetCode = this.generateCode();
    users[idx] = { ...users[idx], resetCode };
    this.persistUsers(users);
    this.users.set(users);
    return { ok: true, message: 'Reset code generated. Check your email.', resetCode };
  }

  resetPassword(email: string, code: string, newPassword: string) {
    const users = [...this.users()];
    const idx = users.findIndex((u) => u.email === email.toLowerCase());
    if (idx === -1) return { ok: false, message: 'No account found.' };
    if (users[idx].resetCode !== code) return { ok: false, message: 'Invalid reset code.' };
    users[idx] = { ...users[idx], password: newPassword, resetCode: undefined };
    this.persistUsers(users);
    this.users.set(users);
    return { ok: true, message: 'Password updated. You can log in.' };
  }

  role() {
    return this.currentUser()?.role ?? null;
  }

  isLoggedIn() {
    return !!this.currentUser();
  }

  private generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private loadUsers(): User[] {
    const raw = this.storage()?.getItem(this.usersKey) ?? null;
    return raw ? (JSON.parse(raw) as User[]) : [];
  }

  private persistUsers(users: User[]) {
    this.storage()?.setItem(this.usersKey, JSON.stringify(users));
  }

  private loadSession(): User | null {
    const raw = this.storage()?.getItem(this.sessionKey) ?? null;
    return raw ? (JSON.parse(raw) as User) : null;
  }

  private storage(): Storage | null {
    const value = (globalThis as { localStorage?: Storage }).localStorage;
    return value && typeof value.getItem === 'function' ? value : null;
  }
}
