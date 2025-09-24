// C:\ChristianMoraProjects\RoloApp\Híbrida\src\app\app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'locations',
    pathMatch: 'full',
  },
  {
    path: 'locations',
    loadComponent: () => import('../app/pages/locations/locations.page').then(m => m.LocationsPage)
  },
  {
    path: '**',
    redirectTo: 'locations'
  }
];