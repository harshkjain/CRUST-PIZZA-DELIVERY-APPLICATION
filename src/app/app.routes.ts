import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing.component';
import { LoginComponent } from './components/login.component';
import { RegisterComponent } from './components/register.component';
import { VerifyEmailComponent } from './components/verify-email.component';
import { ForgotPasswordComponent } from './components/forgot-password.component';
import { UserDashboardComponent } from './components/user-dashboard.component';
import { AdminDashboardComponent } from './components/admin-dashboard.component';
import { OrderHistoryComponent } from './components/order-history.component';
import { PaymentComponent } from './components/payment.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify', component: VerifyEmailComponent },
  { path: 'forgot', component: ForgotPasswordComponent },
  { path: 'user', component: UserDashboardComponent, canActivate: [authGuard], data: { role: 'user' } },
  { path: 'payment', component: PaymentComponent, canActivate: [authGuard], data: { role: 'user' } },
  { path: 'orders', component: OrderHistoryComponent, canActivate: [authGuard], data: { role: 'user' } },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [authGuard], data: { role: 'admin' } },
  { path: '**', redirectTo: '' }
];
