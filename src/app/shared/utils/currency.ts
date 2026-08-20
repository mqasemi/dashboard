import { toPersianDigits } from '@core';

/** Iranian currency units. Accounting is in Rial; Toman (= 10 Rial) is what users read. */
export type CurrencyUnit = 'rial' | 'toman';

const UNIT_LABEL: Record<CurrencyUnit, string> = {
  rial: 'ریال',
  toman: 'تومان'
};

/** Persian thousands separator (U+066C), rather than the Latin comma. */
const GROUP_SEPARATOR = '٬';

export interface CurrencyOptions {
  /** Unit to display in; `toman` divides the Rial amount by 10. Default `toman`. */
  unit?: CurrencyUnit;
  /** Fraction digits. Default `0` — fractional Rial is not used in practice. */
  digits?: number;
  /**
   * Digit shaper. Defaults to Persian digits; pass `NumberFormatService.shape()` to make the
   * output follow the user's Persian-digit setting, or the identity function to force Latin.
   */
  shape?: (value: string) => string;
}

/**
 * Format an amount as Iranian currency for display.
 *
 * @param value Amount in **Rial** — the unit services exchange with the API.
 *
 * @example
 * ```ts
 * currency(1250000);                              // '۱۲۵٬۰۰۰ تومان'
 * currency(1250000, { unit: 'rial' });            // '۱٬۲۵۰٬۰۰۰ ریال'
 * currency(1250000, { shape: numberFormat.shape() }); // follows the user's digit setting
 * ```
 */
export function currency(value: number, options: CurrencyOptions = {}): string {
  const { unit = 'toman', digits = 0, shape = toPersianDigits } = options;
  const amount = unit === 'toman' ? value / 10 : value;
  // Group with a fixed locale so the separator is predictable, then localise it explicitly —
  // `toLocaleString('fa-IR')` would also pre-shape the digits and bypass `shape`.
  const grouped = amount
    .toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits, useGrouping: true })
    .replace(/,/g, GROUP_SEPARATOR);
  return `${shape(grouped)} ${UNIT_LABEL[unit]}`;
}
