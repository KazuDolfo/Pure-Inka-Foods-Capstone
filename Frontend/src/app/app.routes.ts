import { Routes } from '@angular/router';
import { authGuard } from '../services/auth/auth.guard';
import { adminGuard } from '../services/auth/admin.guard';
import { clientGuard } from '../services/auth/client.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then(m => m.Home), canActivate: [clientGuard], title: 'Inicio' },
  { path: 'shop', loadComponent: () => import('./pages/shop/shop').then(m => m.Shop), canActivate: [clientGuard], title: 'Tienda' },
  { path: 'about', loadComponent: () => import('./pages/about/about').then(m => m.About), canActivate: [clientGuard], title: 'Nosotros' },
  { path: 'contact', loadComponent: () => import('./pages/contact/contact').then(m => m.Contact), canActivate: [clientGuard], title: 'Contacto' },
  { path: 'user-profile', loadComponent: () => import('./pages/user-profile/user-profile').then(m => m.UserProfile), canActivate: [authGuard], title: 'Mi Perfil' },
  { path: 'auth', loadComponent: () => import('./pages/auth/auth').then(m => m.Auth), title: 'Acceso' },
  { path: 'checkout', loadComponent: () => import('./pages/checkout/checkout').then(m => m.Checkout), canActivate: [authGuard, clientGuard], title: 'Checkout' },

  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin').then(m => m.AdminPage),
    canActivate: [adminGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/admin/dashboard/dashboard').then(m => m.DashboardComponent), title: 'Admin - Dashboard' },
      { path: 'products', loadComponent: () => import('./pages/admin/products/products').then(m => m.ProductsComponent), title: 'Admin - Productos' },
      { path: 'orders', loadComponent: () => import('./pages/admin/orders/orders').then(m => m.Orders), title: 'Admin - Pedidos' },
      { path: 'users', loadComponent: () => import('./pages/admin/users/users').then(m => m.UsersComponent), title: 'Admin - Usuarios' },
      { path: 'messages', loadComponent: () => import('./pages/admin/messages/messages').then(m => m.MessagesComponent), title: 'Admin - Mensajes' },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: '' }
];
