import { Routes } from '@angular/router';
import { Role } from './model/user';
import { authGuard } from './service/auth-guard.service';
import { notAuthGuard } from './service/not-auth-guard.service';
import { RoleGuard } from './service/role-guard.service';

export const routes: Routes = [
    { path: 'login', canActivate: [notAuthGuard], loadComponent: () => import('./page/login/login.page').then(m => m.LoginPage) },
    { path: 'signup', loadComponent: () => import('./page/signup/signup.page').then(m => m.SignupPage) },
    {
        path: '', loadComponent: () => import('./page/home/home.page').then(m => m.HomePage),
        children: [
            { path: '', redirectTo: 'apiKeys', pathMatch: 'full' },
            { path: 'apiKeys', canActivate: [authGuard], loadComponent: () => import('./page/home/api-key-list/api-key-list.page').then(m => m.APIKeyPage), data: { pageTitle: 'API Keys' } },
            { path: 'api-docs', canActivate: [authGuard], loadComponent: () => import('./page/home/api-docs/api-docs.page').then(m => m.APIDocsPage), data: { pageTitle: 'API Docs' } },
            { path: 'users', canActivate: [authGuard, RoleGuard], loadComponent: () => import('./page/home/user-list/user-list.page').then(m => m.UserListPage), data: { pageTitle: 'User Management', roles: [Role.ADMIN] } },],
    },
    { path: '**', redirectTo: '' }
];