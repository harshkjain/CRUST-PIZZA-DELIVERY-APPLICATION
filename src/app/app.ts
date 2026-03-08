import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('Crust Pizza');
  readonly theme = signal<'light' | 'dark'>('light');

  constructor(
    public auth: AuthService,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  ngOnInit(): void {
    const stored = this.storage()?.getItem('pizza_theme') ?? null;
    this.theme.set(stored === 'dark' ? 'dark' : 'light');
    this.applyTheme();
  }

  toggleTheme() {
    this.theme.set(this.theme() === 'light' ? 'dark' : 'light');
    this.storage()?.setItem('pizza_theme', this.theme());
    this.applyTheme();
  }

  logout() {
    this.auth.logout();
  }

  private applyTheme() {
    this.document.documentElement.setAttribute('data-theme', this.theme());
  }

  private storage(): Storage | null {
    const value = (globalThis as { localStorage?: Storage }).localStorage;
    return value && typeof value.getItem === 'function' ? value : null;
  }
}
