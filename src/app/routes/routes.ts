import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { LayoutModeService, startPageGuard } from '@core';
import { authSimpleCanActivate, authSimpleCanActivateChild } from '@delon/auth';

import { LayoutBasicComponent } from '../layout';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutBasicComponent,
    canActivate: [startPageGuard, authSimpleCanActivate],
    canActivateChild: [authSimpleCanActivateChild],
    data: {},
    children: [
      /**
       * The root URL lands wherever the persisted layout mode says: the tile grid in `portal` mode,
       * the dashboard otherwise. A function `redirectTo` runs inside an injection context and is
       * evaluated per navigation, so switching modes changes where `/` goes without a reload —
       * a static `redirectTo` would be fixed at config time.
       */
      { path: '', redirectTo: () => inject(LayoutModeService).startPage(), pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent, data: { title: 'داشبورد' } }
    ]
  },
  // portal (masonry tile grid) — its own blank-layout shell, so it sits outside the basic layout
  { path: '', loadChildren: () => import('./portal/routes').then(m => m.routes) },
  // passport
  { path: '', loadChildren: () => import('./passport/routes').then(m => m.routes) },
  { path: 'exception', loadChildren: () => import('./exception/routes').then(m => m.routes) },
  { path: '**', redirectTo: 'exception/404' }
];
