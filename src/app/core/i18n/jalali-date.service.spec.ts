import { TestBed } from '@angular/core/testing';

import { JALALI_DATETIME_FORMAT, JALALI_LONG_FORMAT, JalaliDateService } from './jalali-date.service';
import { NumberFormatService } from './number-format.service';

const STORAGE_KEY = 'dashboard.persian-digits';

describe('JalaliDateService', () => {
  let srv: JalaliDateService;
  let numberFormat: NumberFormatService;

  beforeEach(() => {
    // Latin digits keep the assertions readable; a dedicated case covers the shaped output.
    localStorage.setItem(STORAGE_KEY, 'false');
    TestBed.configureTestingModule({});
    srv = TestBed.inject(JalaliDateService);
    numberFormat = TestBed.inject(NumberFormatService);
  });

  afterEach(() => localStorage.removeItem(STORAGE_KEY));

  describe('format', () => {
    it('should render a Gregorian date on the Jalali calendar', () => {
      // 2026-08-18 (Gregorian) === 1405-05-27 (Jalali)
      expect(srv.format(new Date(2026, 7, 18))).toBe('1405/05/27');
    });

    it('should accept an ISO string from an API', () => {
      expect(srv.format('2026-08-18T10:00:00')).toBe('1405/05/27');
    });

    it('should honour a custom pattern', () => {
      expect(srv.format(new Date(2026, 7, 18, 14, 30), JALALI_DATETIME_FORMAT)).toBe('1405/05/27 14:30');
    });

    it('should render Persian month names', () => {
      expect(srv.format(new Date(2026, 7, 18), JALALI_LONG_FORMAT)).toContain('مرداد');
    });

    it('should return an empty string for absent values', () => {
      expect(srv.format(null)).toBe('');
      expect(srv.format(undefined)).toBe('');
      expect(srv.format('')).toBe('');
      expect(srv.format('not-a-date')).toBe('');
    });

    it('should shape digits when Persian digits are enabled', () => {
      numberFormat.setPersianDigits(true);

      expect(srv.format(new Date(2026, 7, 18))).toBe('۱۴۰۵/۰۵/۲۷');
    });
  });

  describe('parse', () => {
    it('should read a Jalali date typed with Latin digits', () => {
      const parsed = srv.parse('1405/05/27');

      expect(parsed).not.toBeNull();
      expect(parsed!.getFullYear()).toBe(2026);
      expect(parsed!.getMonth()).toBe(7);
      expect(parsed!.getDate()).toBe(18);
    });

    it('should read a Jalali date typed with Persian digits', () => {
      expect(srv.toISODate(srv.parse('۱۴۰۵/۰۵/۲۷'))).toBe('2026-08-18');
    });

    it('should return null for an unparseable value', () => {
      expect(srv.parse('حرف')).toBeNull();
    });
  });

  describe('toISODate', () => {
    it('should serialise from local components, not UTC', () => {
      // Iran is UTC+03:30: `toISOString()` on a midnight local date would report the previous day.
      expect(srv.toISODate(new Date(2026, 7, 18, 0, 30))).toBe('2026-08-18');
    });

    it('should zero-pad month and day', () => {
      expect(srv.toISODate(new Date(2026, 0, 5))).toBe('2026-01-05');
    });

    it('should return null for absent values', () => {
      expect(srv.toISODate(null)).toBeNull();
      expect(srv.toISODate('')).toBeNull();
    });

    it('should round-trip a Jalali string through the API boundary', () => {
      const iso = srv.toISODate(srv.parse('1405/05/27'));

      expect(iso).toBe('2026-08-18');
      expect(srv.format(iso)).toBe('1405/05/27');
    });
  });

  describe('toISOString', () => {
    it('should produce a Gregorian UTC instant', () => {
      expect(srv.toISOString(new Date(Date.UTC(2026, 7, 18, 10, 0)))).toBe('2026-08-18T10:00:00.000Z');
    });

    it('should return null for absent values', () => {
      expect(srv.toISOString(undefined)).toBeNull();
    });
  });

  describe('toDate', () => {
    it('should pass a Date through', () => {
      const date = new Date(2026, 7, 18);

      expect(srv.toDate(date)).toBe(date);
    });

    it('should reject invalid input', () => {
      expect(srv.toDate('rubbish')).toBeNull();
    });
  });
});
