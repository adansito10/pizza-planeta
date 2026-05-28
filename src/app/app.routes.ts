import { Routes } from '@angular/router';
import { KioskLayout } from './features/kiosk/kiosk-layout';
import { AdminLayout } from './features/admin/pages/admin-layout/admin-layout';
import { DashboardComponent } from './features/admin/pages/dashboard/dashboard';
import { OrdersComponent } from './features/admin/pages/orders/orders';
import { CatalogMgrComponent } from './features/admin/pages/catalog-mgr/catalog-mgr';
import { SettingsComponent } from './features/admin/pages/settings/settings';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'kiosk',
    component: KioskLayout
  },

  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'orders',
        component: OrdersComponent
      },
      {
        path: 'catalog',
        component: CatalogMgrComponent
      },
      {
        path: 'settings',
        component: SettingsComponent
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: 'kiosk',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'kiosk'
  }
];

