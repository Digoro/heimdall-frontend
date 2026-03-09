import { Routes } from '@angular/router';
import { authGuard } from './service/auth-guard.service';

export const routes: Routes = [
    { path: 'login', loadComponent: () => import('./page/login/login.page').then(m => m.LoginPage) },
    { path: 'signup', loadComponent: () => import('./page/signup/signup.page').then(m => m.SignupPage) },
    {
        path: '', loadComponent: () => import('./page/home/home.page').then(m => m.HomePage),
        children: [
            { path: '', redirectTo: 'apiKeys', pathMatch: 'full' },
            { path: 'apiKeys', loadComponent: () => import('./page/home/api-key-list/api-key-list.page').then(m => m.APIKeyPage) },
            { path: 'api/docs', loadComponent: () => import('./page/home/api-docs/api-docs.page').then(m => m.APIDocsPage) },
        ],
    },
    { path: 'users', canActivate: [authGuard], loadComponent: () => import('./page/user/user.page').then(m => m.UserPage) },
    { path: '**', redirectTo: '' }
];