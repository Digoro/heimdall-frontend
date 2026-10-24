import { Routes } from '@angular/router';
import { Role } from './model/user';
import { authGuard } from './service/auth-guard.service';
import { RoleGuard } from './service/role-guard.service';
import { notAuthGuard } from './service/not-auth-guard.service';
import { homeRedirectGuard } from './service/home-redirect.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [notAuthGuard],
    loadComponent: () => import('./page/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'signup',
    loadComponent: () => import('./page/signup/signup.page').then((m) => m.SignupPage),
  },
  {
    path: '',
    loadComponent: () => import('./page/home/home.page').then((m) => m.HomePage),
    children: [
      { path: '', pathMatch: 'full', canActivate: [homeRedirectGuard], children: [] },
      {
        path: 'apiKeys',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./page/home/api-key-list/api-key-list.page').then((m) => m.APIKeyPage),
        data: { pageTitle: 'API Keys' },
      },
      {
        path: 'api-docs',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./page/home/api-docs/api-docs.page').then((m) => m.APIDocsPage),
        data: { pageTitle: 'API Docs' },
      },
      {
        path: 'imagery-search',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./page/home/imagery-search/imagery-search.page').then((m) => m.ImagerySearchPage),
        data: { pageTitle: 'Imagery Search' },
      },
      {
        path: 'tasking-order',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./page/home/coming-soon/coming-soon.page').then((m) => m.ComingSoonPage),
        data: { pageTitle: 'Tasking Order' },
      },
      {
        path: 'cart',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./page/home/coming-soon/coming-soon.page').then((m) => m.ComingSoonPage),
        data: { pageTitle: 'Cart' },
      },
      {
        path: 'my-orders',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./page/home/coming-soon/coming-soon.page').then((m) => m.ComingSoonPage),
        data: { pageTitle: 'My Orders' },
      },
      {
        path: 'aoi',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./page/home/coming-soon/coming-soon.page').then((m) => m.ComingSoonPage),
        data: { pageTitle: 'AOI' },
      },
      {
        path: 'usage',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./page/home/coming-soon/coming-soon.page').then((m) => m.ComingSoonPage),
        data: { pageTitle: 'Usage' },
      },
      {
        path: 'users',
        canActivate: [authGuard, RoleGuard],
        loadComponent: () =>
          import('./page/home/user-list/user-list.page').then((m) => m.UserListPage),
        data: { pageTitle: 'User Management', roles: [Role.ADMIN] },
      },
      {
        path: 'orders',
        canActivate: [authGuard, RoleGuard],
        loadComponent: () =>
          import('./page/home/order-list/order-list.page').then((m) => m.OrderListPage),
        data: { pageTitle: 'Order Management', roles: [Role.ADMIN] },
      },
      {
        path: 'catalogs',
        canActivate: [authGuard, RoleGuard],
        loadComponent: () =>
          import('./page/home/catalog-list/catalog-list.page').then((m) => m.CatalogListPage),
        data: { pageTitle: 'Catalog Management', roles: [Role.ADMIN] },
      },
      {
        path: 'catalogs/:id',
        canActivate: [authGuard, RoleGuard],
        loadComponent: () =>
          import('./page/home/catalog-detail/catalog-detail.page').then((m) => m.CatalogDetailPage),
        data: { pageTitle: 'Catalog Management', roles: [Role.ADMIN] },
      },
      {
        path: 'settings',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./page/home/settings/settings.page').then((m) => m.SettingsPage),
        data: { pageTitle: 'Settings' },
      },
      {
        path: 'orders/:id',
        canActivate: [authGuard, RoleGuard],
        loadComponent: () =>
          import('./page/home/order-detail/order-detail.page').then((m) => m.OrderDetailPage),
        data: { pageTitle: 'Order Management', roles: [Role.ADMIN] },
      },
      {
        path: 'upload-product',
        canActivate: [authGuard, RoleGuard],
        loadComponent: () =>
          import('./page/home/product-upload/product-upload.page').then((m) => m.ProductUploadPage),
        data: { pageTitle: 'Register Imagery Product', roles: [Role.ADMIN] },
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
