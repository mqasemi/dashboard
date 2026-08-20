import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { default as ngLang } from '@angular/common/locales/fa';
import { ApplicationConfig, EnvironmentProviders, Provider, isDevMode } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  provideRouter,
  withComponentInputBinding,
  withViewTransitions,
  withInMemoryScrolling,
  withHashLocation,
  RouterFeatures
} from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { defaultInterceptor, faIR as delonLang, provideDirection, provideJalaliCalendar, provideStartup, JALALI_ZORRO_LANG } from '@core';
import { provideCellWidgets } from '@delon/abc/cell';
import { provideSTWidgets } from '@delon/abc/st';
import { authSimpleInterceptor, provideAuth } from '@delon/auth';
import { provideSFConfig } from '@delon/form';
import { AlainProvideLang, provideAlain } from '@delon/theme';
import { AlainConfig } from '@delon/util/config';
import { environment } from '@env/environment';
import { CELL_WIDGETS, ST_WIDGETS, SF_WIDGETS } from '@shared';
import { faIR as dateLang } from 'date-fns-jalali/locale';
import { NzConfig, provideNzConfig } from 'ng-zorro-antd/core/config';

import { ICONS } from '../style-icons';
import { ICONS_AUTO } from '../style-icons-auto';
import { provideBindAuthRefresh } from './core/net';
import { routes } from './routes/routes';

/**
 * Persian locale, wired across all four layers that need it:
 * - `ng`     — Angular's own `DatePipe`/`DecimalPipe` data
 * - `zorro`  — `ng-zorro` component strings; `JALALI_ZORRO_LANG` is upstream `fa_IR` with its
 *              date-picker formats corrected for a Jalali calendar (see `core/i18n`)
 * - `date`   — `NZ_DATE_LOCALE`; combined with the `date-fns` → `date-fns-jalali` alias and
 *              `provideJalaliCalendar()` this is what makes every `nz-date-picker` render Jalali
 * - `delon`  — hand-authored, since `@delon/theme` ships no `fa_IR` (see `core/i18n`)
 */
const defaultLang: AlainProvideLang = {
  abbr: 'fa-IR',
  ng: ngLang,
  zorro: JALALI_ZORRO_LANG,
  date: dateLang,
  delon: delonLang
};

const alainConfig: AlainConfig = {
  auth: { login_url: '/passport/login' }
};

/**
 * `nzDirection` is not set here — `provideDirection()` pushes the persisted direction into
 * every RTL-aware component at bootstrap, which also keeps the runtime toggle working.
 */
const ngZorroConfig: NzConfig = {
  theme: { primaryColor: '#1890ff' }
};

const routerFeatures: RouterFeatures[] = [
  withComponentInputBinding(),
  withViewTransitions(),
  withInMemoryScrolling({ scrollPositionRestoration: 'top' })
];
if (environment.useHash) routerFeatures.push(withHashLocation());

const providers: Array<Provider | EnvironmentProviders> = [
  provideHttpClient(withInterceptors([...(environment.interceptorFns ?? []), authSimpleInterceptor, defaultInterceptor])),
  provideAnimations(),
  provideRouter(routes, ...routerFeatures),
  provideAlain({ config: alainConfig, defaultLang, icons: [...ICONS_AUTO, ...ICONS] }),
  provideNzConfig(ngZorroConfig),
  provideDirection(),
  provideJalaliCalendar(),
  provideAuth(),
  provideCellWidgets(...CELL_WIDGETS),
  provideSTWidgets(...ST_WIDGETS),
  provideSFConfig({
    widgets: [...SF_WIDGETS]
  }),
  provideStartup(),
  provideServiceWorker('ngsw-worker.js', {
    enabled: !isDevMode(),
    registrationStrategy: 'registerWhenStable:30000'
  }),
  ...(environment.providers || [])
];

// If you use `@delon/auth` to refresh the token, additional registration `provideBindAuthRefresh` is required
if (environment.api?.refreshTokenEnabled && environment.api.refreshTokenType === 'auth-refresh') {
  providers.push(provideBindAuthRefresh());
}

export const appConfig: ApplicationConfig = {
  providers: providers
};
