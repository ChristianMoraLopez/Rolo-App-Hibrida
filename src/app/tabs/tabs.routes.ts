import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'feed',
        loadComponent: () => import('../pages/feed/feed.page').then(m => m.FeedPage),
      },
      {
        path: 'explore',
        loadComponent: () => import('../pages/locations/explore/explore.page').then(m => m.ExplorePage),
      },
      {
        path: 'add-location',
        loadComponent: () => import('../pages/locations/add-location/add-location.page').then(m => m.AddLocationPage),
      },
      // Profile page not present in this repository; remove or add later
      {
        path: '',
        redirectTo: 'feed',
        pathMatch: 'full',
      },
    ],
  },
];
