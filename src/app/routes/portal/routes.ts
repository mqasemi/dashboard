import { Routes } from '@angular/router';
import { authSimpleCanActivate, authSimpleCanActivateChild } from '@delon/auth';

import { PortalComponent } from './portal.component';
import { LayoutBlankComponent } from '../../layout';

/**
 * The portal is guarded exactly like the sidebar shell — the tiles expose the whole menu, so an
 * unauthenticated visitor must be bounced to the login page rather than shown the app's structure.
 */
export const routes: Routes = [
  {
    path: 'portal',
    component: LayoutBlankComponent,
    canActivate: [authSimpleCanActivate],
    canActivateChild: [authSimpleCanActivateChild],
    children: [{ path: '', component: PortalComponent, data: { title: 'پورتال' } }]
  }
];
