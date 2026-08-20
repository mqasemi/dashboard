import { Routes } from '@angular/router';

import { CallbackComponent } from './callback.component';
import { UserLockComponent } from './lock/lock.component';
import { UserLoginComponent } from './login/login.component';
import { UserRegisterComponent } from './register/register.component';
import { UserRegisterResultComponent } from './register-result/register-result.component';
import { LayoutPassportComponent } from '../../layout';

export const routes: Routes = [
  // passport
  {
    path: 'passport',
    component: LayoutPassportComponent,
    children: [
      {
        path: 'login',
        component: UserLoginComponent,
        data: { title: 'ورود' }
      },
      {
        path: 'register',
        component: UserRegisterComponent,
        data: { title: 'ثبت‌نام' }
      },
      {
        path: 'register-result',
        component: UserRegisterResultComponent,
        data: { title: 'نتیجهٔ ثبت‌نام' }
      },
      {
        path: 'lock',
        component: UserLockComponent,
        data: { title: 'صفحهٔ قفل' }
      }
    ]
  },
  // Standalone page, rendered without the passport layout
  { path: 'passport/callback/:type', component: CallbackComponent }
];
