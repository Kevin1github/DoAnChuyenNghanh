import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { HelpComponent } from './components/help/help.component';
import { AboutComponent } from './components/about/about.component';
import { AccountManagementComponent } from './components/admin/account-management/account-management.component';
import { BillManagementComponent } from './components/admin/bill-management/bill-management.component';
import { ReportsComponent } from './components/admin/reports/reports.component';
import { BillPaymentComponent } from './components/user/bill-payment/bill-payment.component';
import { ProfileComponent } from './components/user/profile/profile.component';
import { PaymentHistoryComponent } from './components/user/payment-history/payment-history.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { userGuard } from './guards/user.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'help', component: HelpComponent },
  { path: 'about', component: AboutComponent },
  
  // Admin routes
  { 
    path: 'admin/accounts', 
    component: AccountManagementComponent,
    canActivate: [authGuard, adminGuard]
  },
  { 
    path: 'admin/bills', 
    component: BillManagementComponent,
    canActivate: [authGuard, adminGuard]
  },
  { 
    path: 'admin/reports', 
    component: ReportsComponent,
    canActivate: [authGuard, adminGuard]
  },
  
  // User routes
  { 
    path: 'user/bills', 
    component: BillPaymentComponent,
    canActivate: [authGuard, userGuard]
  },
  { 
    path: 'user/profile', 
    component: ProfileComponent,
    canActivate: [authGuard, userGuard]
  },
  { 
    path: 'user/payment-history', 
    component: PaymentHistoryComponent,
    canActivate: [authGuard, userGuard]
  },
  
  // Wildcard route
  { path: '**', redirectTo: '/home' }
];
