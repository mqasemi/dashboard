import { AsyncPipe, JsonPipe, NgTemplateOutlet } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet, RouterLink } from '@angular/router';
import { DatePipe, I18nPipe } from '@delon/theme';

import { SHARED_PIPES } from './pipes/index';
import { SHARED_DELON_MODULES } from './shared-delon.module';
import { SHARED_ZORRO_MODULES } from './shared-zorro.module';

export const SHARED_IMPORTS = [
  FormsModule,
  ReactiveFormsModule,
  RouterLink,
  RouterOutlet,
  NgTemplateOutlet,
  I18nPipe,
  JsonPipe,
  DatePipe,
  AsyncPipe,
  ...SHARED_PIPES,
  ...SHARED_DELON_MODULES,
  ...SHARED_ZORRO_MODULES
];
