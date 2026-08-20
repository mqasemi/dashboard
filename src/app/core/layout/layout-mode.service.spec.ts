import { TestBed } from '@angular/core/testing';

import { DEFAULT_LAYOUT_MODE, LAYOUT_MODES, LAYOUT_MODE_META, LayoutModeService } from './layout-mode.service';

const STORAGE_KEY = 'dashboard.layout-mode';

describe('LayoutModeService', () => {
  beforeEach(() => localStorage.removeItem(STORAGE_KEY));
  afterEach(() => localStorage.removeItem(STORAGE_KEY));

  /** The stored value is read in the field initialiser, so nothing may be injected before seeding. */
  function boot(): LayoutModeService {
    TestBed.configureTestingModule({});
    return TestBed.inject(LayoutModeService);
  }

  it('should default to the right-sidebar layout on a first visit', () => {
    expect(boot().mode()).toBe('sidebar');
    expect(DEFAULT_LAYOUT_MODE).toBe('sidebar');
  });

  it('should restore a persisted mode at bootstrap', () => {
    localStorage.setItem(STORAGE_KEY, 'top');

    expect(boot().mode()).toBe('top');
  });

  it('should fall back to the default for an unrecognised persisted value', () => {
    localStorage.setItem(STORAGE_KEY, 'masonry-ish');

    expect(boot().mode()).toBe(DEFAULT_LAYOUT_MODE);
  });

  it('should persist a newly selected mode', () => {
    const srv = boot();

    srv.setMode('portal');
    TestBed.tick(); // flush the persisting effect

    expect(localStorage.getItem(STORAGE_KEY)).toBe('portal');
  });

  it('should only hide the aside in top-menu mode', () => {
    const srv = boot();

    expect(srv.isTopMenu()).toBeFalse();
    srv.setMode('top');
    expect(srv.isTopMenu()).toBeTrue();
    srv.setMode('portal');
    expect(srv.isTopMenu()).toBeFalse();
  });

  it('should only route `/` to the portal in portal mode', () => {
    const srv = boot();

    expect(srv.startPage()).toBe('/dashboard');
    srv.setMode('top');
    expect(srv.startPage()).toBe('/dashboard');
    srv.setMode('portal');
    expect(srv.startPage()).toBe('/portal');
  });

  it('should describe every mode for the switcher', () => {
    // A mode without metadata would render as a blank menu row.
    for (const mode of LAYOUT_MODES) {
      expect(LAYOUT_MODE_META[mode].label).toBeTruthy();
      expect(LAYOUT_MODE_META[mode].icon).toBeTruthy();
    }
  });
});
