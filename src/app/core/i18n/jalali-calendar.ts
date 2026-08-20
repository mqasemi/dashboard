import { provideEnvironmentInitializer } from '@angular/core';
import { getDate, getMonth, getYear, setDate } from 'date-fns-jalali';
import { CandyDate } from 'ng-zorro-antd/core/time';
import { NzI18nInterface, fa_IR } from 'ng-zorro-antd/i18n';

/**
 * Makes `nz-date-picker` a genuinely Jalali calendar.
 *
 * ## The problem
 *
 * Aliasing `date-fns` to `date-fns-jalali` gets us most of the way (see
 * `scripts/dedupe-date-fns.mjs`), because ng-zorro builds its picker grids out of `date-fns`
 * arithmetic. But `CandyDate` — the value object every picker panel is built on — is *half*
 * converted. Its mutators go through `date-fns`, so they became Jalali with the alias:
 *
 * ```
 * setYear() setMonth() addYears() addMonths() calendarStart() setDay() setQuarter()
 * ```
 *
 * while its accessors are hand-written native `Date` calls that the alias cannot reach:
 *
 * ```
 * getYear()  -> nativeDate.getFullYear()
 * getMonth() -> nativeDate.getMonth()
 * getDate()  -> nativeDate.getDate()
 * setDate()  -> new Date(nativeDate).setDate(amount)   // native too, despite the name
 * ```
 *
 * So accessors reported Gregorian while mutators interpreted Jalali. Two consequences:
 *
 * 1. **Wrong day numbers.** `DateTableComponent` renders each cell as
 *    ``content: `${date.getDate()}` `` — the Gregorian day-of-month. The Jalali `label` it
 *    computes one line earlier via `DateHelperService.format(…, 'dd')` is never displayed. Same
 *    for the decade/year panels, which derive their ranges from `value.getYear()`.
 *
 * 2. **Value corruption on click.** `DateTableComponent.changeValueFromInside()` round-trips
 *    through `activeDate.setYear(v.getYear()).setMonth(v.getMonth()).setDate(v.getDate())`.
 *    Mixing Gregorian reads with Jalali writes makes that anything but the identity it is meant
 *    to be — selecting 1405-05-28 (2026-08-19) produced **1697-05-19 (2647-11-19 Gregorian)**.
 *
 * ## The fix
 *
 * Route the four accessors through `date-fns-jalali` too, so both halves of `CandyDate` agree on
 * one calendar. This is the narrowest possible intervention: every panel reads the year, month and
 * day through these methods rather than touching `nativeDate` directly, so patching them fixes
 * the date grid, both header buttons, the decade and year range labels and the click round-trip
 * at once, with no component overrides and no fork.
 *
 * `getDay()` (day of week), `getTime()` and the time-of-day accessors stay native — a weekday and
 * a wall clock are the same in both calendars.
 *
 * `addDays(n)` is defined as `setDate(getDate() + n)`, which is why `setDate` has to move with the
 * accessors: patching `getDate` alone would offset every grid by the Gregorian/Jalali day-of-month
 * difference. With all four converted, grid construction stays coherent.
 *
 * ## Known remaining edge
 *
 * `CandyDate.isSame(date, 'decade')` compares `nativeDate.getFullYear()` directly, so it stays
 * Gregorian. Since it only asks whether two years are within 11 of each other and the two calendars
 * differ by a near-constant 621, it agrees with the Jalali answer except at a year boundary, where
 * it can mis-highlight a cell in the decade panel. Not worth a deeper patch.
 *
 * `src/app/core/i18n/date-picker-jalali.spec.ts` asserts the rendered output and fails loudly if
 * any of this regresses.
 */
let patched = false;

/**
 * Converts `CandyDate`'s native accessors to `date-fns-jalali`.
 *
 * Idempotent, and safe to call from tests. Patching the prototype is deliberate: `CandyDate` is
 * public API (`ng-zorro-antd/core/time`), but the picker constructs its own instances internally,
 * so subclassing gives us no way in.
 */
export function patchCandyDateToJalali(): void {
  if (patched) {
    return;
  }
  patched = true;

  const proto = CandyDate.prototype;

  proto.getYear = function (this: CandyDate): number {
    return getYear(this.nativeDate);
  };
  proto.getMonth = function (this: CandyDate): number {
    return getMonth(this.nativeDate);
  };
  proto.getDate = function (this: CandyDate): number {
    return getDate(this.nativeDate);
  };
  proto.setDate = function (this: CandyDate, amount: number): CandyDate {
    return new CandyDate(setDate(this.nativeDate, amount));
  };
}

/**
 * ng-zorro's `fa_IR`, corrected for a Jalali picker.
 *
 * Two defects in the upstream locale, both of which only become visible once the calendar itself
 * is Jalali:
 *
 * - **No `monthFormat`.** `DateHeaderComponent` falls back to `'MMM'`, so the month button rendered
 *   the abbreviation `مرد` instead of `مرداد`. Persian month names are conventionally written out.
 * - **`dateFormat: 'M/D/YYYY'`** is US month-first order, used for the day cells' `title` tooltip.
 *   Persian dates go biggest-unit-first.
 */
export const JALALI_ZORRO_LANG: NzI18nInterface = {
  ...fa_IR,
  DatePicker: {
    ...fa_IR.DatePicker,
    lang: {
      ...fa_IR.DatePicker.lang,
      monthFormat: 'MMMM',
      dateFormat: 'yyyy/MM/dd',
      dateTimeFormat: 'yyyy/MM/dd HH:mm:ss'
    }
  }
};

/**
 * Applies the `CandyDate` patch during bootstrap.
 *
 * An environment initializer runs when the injector is created, which is comfortably before any
 * picker component can construct a `CandyDate`.
 */
export function provideJalaliCalendar(): ReturnType<typeof provideEnvironmentInitializer> {
  return provideEnvironmentInitializer(() => patchCandyDateToJalali());
}
