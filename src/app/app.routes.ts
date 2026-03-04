import { Routes } from '@angular/router';
import { authGuard } from './service/auth-guard.service';

export const routes: Routes = [
    { path: 'login', loadComponent: () => import('./page/login/login.page').then(m => m.LoginPage) },
    { path: 'signup', loadComponent: () => import('./page/signup/signup.page').then(m => m.SignupPage) },
    { path: 'users', canActivate: [authGuard], loadComponent: () => import('./page/user/user.page').then(m => m.UserPage) },
    { path: '', redirectTo: 'login', pathMatch: 'full' }
];
