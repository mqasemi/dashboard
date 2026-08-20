import { Injectable, computed, inject } from '@angular/core';
import { format, isValid, parse } from 'date-fns-jalali';
import { faIR } from 'date-fns-jalali/locale';

import { NumberFormatService } from './number-format.service';
import { toLatinDigits } from './persian-digits';

/** Default Jalali display pattern, e.g. `۱۴۰۵/۰۵/۲۷`. */
export const JALALI_DATE_FORMAT = 'yyyy/MM/dd';

/** Jalali display pattern including time, e.g. `۱۴۰۵/۰۵/۲۷ ۱۴:۳۰`. */
export const JALALI_DATETIME_FORMAT = 'yyyy/MM/dd HH:mm';

/** Long Jalali display pattern, e.g. `سه‌شنبه ۲۷ مرداد ۱۴۰۵`. */
export const JALALI_LONG_FORMAT = 'EEEE d MMMM yyyy';

/** Anything that can reasonably arrive from an API or a form control. */
export type DateInput = Date | string | number | null | undefined;

/**
 * Converts between the API boundary (ISO 8601 / Gregorian) and the presentation layer
 * (Jalali, optionally with Persian digits).
 *
 * `date-fns` is aliased to `date-fns-jalali` project-wide (see `package.json`), so every
 * `format`/`parse` call in the app — and inside `ng-zorro`'s date-picker — interprets dates
 * on the Jalali calendar. The underlying `Date` object is untouched: it still represents an
 * absolute instant, which is what makes the round trip below lossless.
 *
 * Per CLAUDE.md, services exchange ISO/Gregorian with the API and conversion happens only
 * here at the presentation layer.
 */
@Injectable({ providedIn: 'root' })
export class JalaliDateService {
  private readonly numberFormat = inject(NumberFormatService);

  /**
   * Reactive formatter. Reading this in a template tracks the Persian-digit toggle, so
   * views re-render when the user flips it.
   */
  readonly formatter = computed<(value: DateInput, pattern?: string) => string>(() => {
    const shape = this.numberFormat.shape();
    return (value: DateInput, pattern: string = JALALI_DATE_FORMAT) => {
      const date = this.toDate(value);
      return date ? shape(format(date, pattern, { locale: faIR })) : '';
    };
  });

  /**
   * Format a date for display on the Jalali calendar.
   *
   * Digit shaping follows the current `NumberFormatService` setting.
   */
  format(value: DateInput, pattern: string = JALALI_DATE_FORMAT): string {
    return this.formatter()(value, pattern);
  }

  /**
   * Parse a Jalali string (as typed by a user) into a `Date`.
   *
   * Persian digits are normalised first, so `'۱۴۰۵/۰۵/۲۷'` and `'1405/05/27'` both parse.
   * Returns `null` when the input is not a valid date.
   */
  parse(value: string, pattern: string = JALALI_DATE_FORMAT): Date | null {
    const parsed = parse(toLatinDigits(value), pattern, new Date(), { locale: faIR });
    return isValid(parsed) ? parsed : null;
  }

  /**
   * Serialise to a date-only ISO string (`YYYY-MM-DD`) for the API.
   *
   * Deliberately built from *local* Gregorian components rather than `toISOString()`:
   * Iran is UTC+03:30, so a date picked as `1405/05/27` would serialise to the previous
   * day if it were converted to UTC first.
   */
  toISODate(value: DateInput): string | null {
    const date = this.toDate(value);
    if (!date) {
      return null;
    }
    const pad = (n: number): string => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  /**
   * Serialise to a full ISO 8601 instant (UTC) for the API.
   *
   * Use this for timestamps; use {@link toISODate} for calendar dates.
   */
  toISOString(value: DateInput): string | null {
    const date = this.toDate(value);
    return date ? date.toISOString() : null;
  }

  /** Coerce an API value into a `Date`, or `null` when it is absent/unparseable. */
  toDate(value: DateInput): Date | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const date = value instanceof Date ? value : new Date(value);
    return isValid(date) ? date : null;
  }
}
