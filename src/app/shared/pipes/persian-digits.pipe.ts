import { Pipe, PipeTransform, inject } from '@angular/core';
import { NumberFormatService } from '@core';

type Shaper = (value: string) => string;

/**
 * Renders numbers with Persian digits when the Persian-digit setting is enabled.
 *
 * Digits are shaped, not reformatted — chain after a formatting pipe to keep grouping:
 *
 * @example
 * ```html
 * {{ 1024 | persianDigits }}                    <!-- ۱۰۲۴ -->
 * {{ 1024 | number: '1.0-0' | persianDigits }}  <!-- ۱٬۰۲۴ -->
 * ```
 *
 * Impure for the same reason as {@link JalaliDatePipe}: the toggle it depends on is not one of
 * the pipe's arguments, so pure-pipe memoisation would serve a stale string after it flips.
 * The cache below keys on the `computed` shaper's identity, keeping repeat calls to a few
 * reference compares.
 */
@Pipe({
  name: 'persianDigits',
  // eslint-disable-next-line @angular-eslint/no-pipe-impure -- output depends on a signal, not on the arguments
  pure: false
})
export class PersianDigitsPipe implements PipeTransform {
  private readonly numberFormat = inject(NumberFormatService);

  private lastValue: string | number | null | undefined;
  private lastShaper?: Shaper;
  private lastResult = '';

  transform(value: string | number | null | undefined): string {
    const shaper = this.numberFormat.shape();
    if (shaper === this.lastShaper && value === this.lastValue) {
      return this.lastResult;
    }
    this.lastShaper = shaper;
    this.lastValue = value;
    this.lastResult = value === null || value === undefined ? '' : shaper(String(value));
    return this.lastResult;
  }
}
