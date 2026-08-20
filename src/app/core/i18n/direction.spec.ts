import { TestBed } from '@angular/core/testing';
import { ALAIN_SETTING_DEFAULT, LTR, RTL, RTLService } from '@delon/theme';

import { provideDirection } from './direction';

/** `SettingsService` persists the whole layout object under this single key. */
const LAYOUT_KEY = 'layout';

describe('provideDirection', () => {
  beforeEach(() => localStorage.removeItem(LAYOUT_KEY));

  afterEach(() => {
    localStorage.removeItem(LAYOUT_KEY);
    // `RTLService.updateHtml()` also writes a class and an inline style — reset all three so
    // the shared karma <html> element does not leak state between specs.
    const html = document.documentElement;
    html.removeAttribute('dir');
    html.classList.remove(RTL, LTR);
    html.style.removeProperty('direction');
  });

  /** The environment initializer runs on first injector access, so nothing may be injected before seeding. */
  function boot(): RTLService {
    // `RTLService` depends on `SettingsService`, which injects `ALAIN_SETTING_KEYS`. In the app that
    // token arrives via `provideAlain()`; here it has to be supplied explicitly or DI throws.
    TestBed.configureTestingModule({ providers: [ALAIN_SETTING_DEFAULT, provideDirection()] });
    return TestBed.inject(RTLService);
  }

  it('should default to RTL when nothing has been persisted', () => {
    const rtl = boot();

    expect(rtl.dir).toBe(RTL);
    expect(document.documentElement.getAttribute('dir')).toBe(RTL);
  });

  it('should honour a persisted LTR choice', () => {
    localStorage.setItem(LAYOUT_KEY, JSON.stringify({ direction: LTR }));

    const rtl = boot();

    expect(rtl.dir).toBe(LTR);
    expect(document.documentElement.getAttribute('dir')).toBe(LTR);
  });

  it('should fall back to RTL for an unrecognised persisted value', () => {
    localStorage.setItem(LAYOUT_KEY, JSON.stringify({ direction: 'sideways' }));

    expect(boot().dir).toBe(RTL);
  });

  it('should expose the opposite direction for the header toggle', () => {
    const rtl = boot();

    expect(rtl.nextDir).toBe(LTR);

    rtl.toggle();

    expect(rtl.dir).toBe(LTR);
    expect(rtl.nextDir).toBe(RTL);
  });
});
