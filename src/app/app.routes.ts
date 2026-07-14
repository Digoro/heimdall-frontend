import { Routes } from '@angular/router';
import { Role } from './model/user';
import { authGuard } from './service/auth-guard.service';
import { RoleGuard } from './service/role-guard.service';
import { notAuthGuard } from './service/not-auth-guard.service';

export const routes: Routes = [
    { path: 'login', canActivate: [notAuthGuard], loadComponent: () => import('./page/login/login.page').then(m => m.LoginPage) },
    { path: 'signup', loadComponent: () => import('./page/signup/signup.page').then(m => m.SignupPage) },
    {
        path: '', loadComponent: () => import('./page/home/home.page').then(m => m.HomePage),
        children: [
            { path: '', redirectTo: 'apiKeys', pathMatch: 'full' },
            { path: 'apiKeys', canActivate: [authGuard], loadComponent: () => import('./page/home/api-key-list/api-key-list.page').then(m => m.APIKeyPage), data: { pageTitle: 'API Keys' } },
            { path: 'api-docs', canActivate: [authGuard], loadComponent: () => import('./page/home/api-docs/api-docs.page').then(m => m.APIDocsPage), data: { pageTitle: 'API Docs' } },
            { path: 'users', canActivate: [authGuard, RoleGuard], loadComponent: () => import('./page/home/user-list/user-list.page').then(m => m.UserListPage), data: { pageTitle: 'User Management', roles: [Role.ADMIN] } },
            { path: 'orders', canActivate: [authGuard, RoleGuard], loadComponent: () => import('./page/home/order-list/order-list.page').then(m => m.OrderListPage), data: { pageTitle: 'Order Management', roles: [Role.ADMIN] }, },
            { path: 'catalogs', canActivate: [authGuard, RoleGuard], loadComponent: () => import('./page/home/catalog-list/catalog-list.page').then(m => m.CatalogListPage), data: { pageTitle: 'Catalog Management', roles: [Role.ADMIN] }, },
            { path: 'settings', canActivate: [authGuard], loadComponent: () => import('./page/home/settings/settings.page').then(m => m.SettingsPage), data: { pageTitle: 'Settings' }, },
            { path: 'orders/:id', canActivate: [authGuard, RoleGuard], loadComponent: () => import('./page/home/order-detail/order-detail.page').then(m => m.OrderDetailPage), data: { pageTitle: 'Order Management', roles: [Role.ADMIN] } },
            { path: 'upload-product', canActivate: [authGuard, RoleGuard], loadComponent: () => import('./page/home/product-upload/product-upload.page').then(m => m.ProductUploadPage), data: { pageTitle: 'Order Management', roles: [Role.ADMIN] } }
        ],
    },
    { path: '**', redirectTo: '' }
];