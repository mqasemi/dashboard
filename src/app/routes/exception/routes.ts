import { Routes } from '@angular/router';

import { ExceptionComponent } from './exception.component';
import { ExceptionTriggerComponent } from './trigger.component';

export const routes: Routes = [
  { path: '403', component: ExceptionComponent, data: { type: 403, title: 'دسترسی غیرمجاز' } },
  { path: '404', component: ExceptionComponent, data: { type: 404, title: 'صفحه یافت نشد' } },
  { path: '500', component: ExceptionComponent, data: { type: 500, title: 'خطای سرور' } },
  { path: 'trigger', component: ExceptionTriggerComponent, data: { title: 'آزمون خطا' } }
];
