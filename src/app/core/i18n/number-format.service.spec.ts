import { TestBed } from '@angular/core/testing';

import { NumberFormatService } from './number-format.service';

const STORAGE_KEY = 'dashboard.persian-digits';

describe('NumberFormatService', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    TestBed.configureTestingModule({});
  });

  afterEach(() => localStorage.removeItem(STORAGE_KEY));

  it('should default to Persian digits when nothing is stored', () => {
    const srv = TestBed.inject(NumberFormatService);

    expect(srv.persianDigits()).toBeTrue();
    expect(srv.shape()('2026')).toBe('۲۰۲۶');
  });

  it('should honour a stored opt-out', () => {
    localStorage.setItem(STORAGE_KEY, 'false');

    const srv = TestBed.inject(NumberFormatService);

    expect(srv.persianDigits()).toBeFalse();
    expect(srv.shape()('2026')).toBe('2026');
  });

  it('should flip the shaper when toggled', () => {
    const srv = TestBed.inject(NumberFormatService);

    expect(srv.shape()('2026')).toBe('۲۰۲۶');

    srv.toggle();

    expect(srv.persianDigits()).toBeFalse();
    expect(srv.shape()('2026')).toBe('2026');
  });

  it('should persist the choice to localStorage', () => {
    const srv = TestBed.inject(NumberFormatService);

    srv.setPersianDigits(false);
    TestBed.tick();

    expect(localStorage.getItem(STORAGE_KEY)).toBe('false');

    srv.setPersianDigits(true);
    TestBed.tick();

    expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
  });
});
