// C:\ChristianMoraProjects\RoloApp\Híbrida\src\app\app.routes.ts
import { Routes } from '@angular/router';
import { AppLayoutComponent } from './shared/components/layout/app-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'feed',
        pathMatch: 'full',
      },
      {
        path: 'feed',
        loadComponent: () => import('./pages/feed/feed.page').then(m => m.FeedPage)
      },
      {
        path: 'explore',
        loadComponent: () => import('./pages/locations/explore/explore.page').then(m => m.ExplorePage)
      },
      {
        path: 'locations',
        loadComponent: () => import('./pages/locations/locations.page').then(m => m.LocationsPage)
      },
      {
        path: 'locations/add',
        loadComponent: () => import('./pages/locations/add-location/add-location.page').then(m => m.AddLocationPage)
      },
      {
        path: 'locations/premium',
        loadComponent: () => import('./pages/locations/premium-locations/premium-locations.page').then(m => m.PremiumLocationsPage)
      },
      {
        path: 'locations/:id',
        loadComponent: () => import('./pages/locations/locations.page').then(m => m.LocationsPage)
      },
      {
        path: 'cart',
        loadComponent: () => import('./pages/cart/cart.page').then(m => m.CartPage)
      },
      {
        path: 'bogotanos',
        loadComponent: () => import('./pages/bogotanos/bogotanos.page').then(m => m.BogotanosPage)
      },
      {
        path: 'add-location',
        loadComponent: () => import('./pages/add-location/add-location.page').then(m => m.AddLocationPage)
      }
    ]
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register.page').then(m => m.RegisterPage)
  },
  {
    path: '**',
    redirectTo: 'feed'
  }
];