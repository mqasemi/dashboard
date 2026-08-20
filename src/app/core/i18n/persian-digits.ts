/**
 * Digit-shaping helpers.
 *
 * These operate on *presentation* strings only. Never run values through `toPersianDigits`
 * before sending them to an API — see `JalaliDateService` for the same rule applied to dates.
 */

/** `۰۱۲۳۴۵۶۷۸۹` — Extended Arabic-Indic digits used in Persian. */
const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'] as const;

/** `٠١٢٣٤٥٦٧٨٩` — Arabic-Indic digits, occasionally present in pasted/legacy data. */
const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'] as const;

/**
 * Convert Latin digits (`0-9`) in a string to Persian digits (`۰-۹`).
 *
 * Non-digit characters are left untouched, so separators and units survive:
 * `'1,024 KB'` becomes `'۱,۰۲۴ KB'`.
 */
export function toPersianDigits(value: string): string {
  return value.replace(/[0-9]/g, d => PERSIAN_DIGITS[+d]);
}

/**
 * Convert Persian (`۰-۹`) and Arabic-Indic (`٠-٩`) digits back to Latin digits.
 *
 * Use this on every user-typed value before parsing or sending it to an API — Persian
 * keyboards emit `۰-۹`, which `Number()` and `parseInt()` cannot read.
 */
export function toLatinDigits(value: string): string {
  return value.replace(/[۰-۹٠-٩]/g, d => {
    const persian = PERSIAN_DIGITS.indexOf(d as (typeof PERSIAN_DIGITS)[number]);
    return String(persian > -1 ? persian : ARABIC_DIGITS.indexOf(d as (typeof ARABIC_DIGITS)[number]));
  });
}
