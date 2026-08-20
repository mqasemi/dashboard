import { Direction } from '@angular/cdk/bidi';
import { EnvironmentProviders, inject, makeEnvironmentProviders, provideEnvironmentInitializer } from '@angular/core';
import { LTR, RTL, RTLService, RTL_DIRECTION, SettingsService } from '@delon/theme';

/**
 * Applies the text direction at bootstrap, defaulting to RTL.
 *
 * `RTLService` reads its initial direction from `SettingsService.layout.direction`, which is
 * `undefined` on a first visit and would therefore fall back to LTR. This initializer flips
 * that default to RTL while still honouring a direction the user previously chose (persisted
 * in `localStorage` by `RTLService`).
 *
 * Assigning `dir` — rather than only writing the setting — is what pushes `nzDirection` into
 * every `ng-zorro` component and `direction` into every `@delon` component, and sets
 * `<html dir>`/`<html class>`.
 */
export function provideDirection(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      const settings = inject(SettingsService);
      const rtl = inject(RTLService);
      const stored = settings.layout[RTL_DIRECTION] as Direction | undefined;
      rtl.dir = stored === LTR ? LTR : RTL;
    })
  ]);
}
