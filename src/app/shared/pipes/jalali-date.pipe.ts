import { Pipe, PipeTransform, inject } from '@angular/core';
import { DateInput, JALALI_DATE_FORMAT, JalaliDateService } from '@core';

type Formatter = (value: DateInput, pattern?: string) => string;

/**
 * Renders a date on the Jalali calendar.
 *
 * @example
 * ```html
 * {{ user.createdAt | jalaliDate }}                      <!-- ۱۴۰۵/۰۵/۲۷ -->
 * {{ user.createdAt | jalaliDate: 'yyyy/MM/dd HH:mm' }}  <!-- ۱۴۰۵/۰۵/۲۷ ۱۴:۳۰ -->
 * {{ user.createdAt | jalaliDate: 'EEEE d MMMM yyyy' }}  <!-- سه‌شنبه ۲۷ مرداد ۱۴۰۵ -->
 * ```
 *
 * ## Why this pipe is impure
 *
 * The output depends on the Persian-digit toggle, which is *not* one of the pipe's arguments.
 * A pure pipe cannot observe that: `ɵɵpipeBind` memoises on the argument list, so when the
 * toggle flips the view is marked dirty but `transform()` is never re-invoked and the stale
 * string is reused. (`@delon/theme`'s own `I18nPipe` has this exact latent bug.)
 *
 * The usual cost of `pure: false` — re-running the work on every change-detection cycle — is
 * paid off by the cache below: the formatter is a `computed`, so its identity is a reliable
 * key for the toggle and a repeat call with unchanged arguments is a few reference compares.
 */
@Pipe({
  name: 'jalaliDate',
  // eslint-disable-next-line @angular-eslint/no-pipe-impure -- see "Why this pipe is impure" above
  pure: false
})
export class JalaliDatePipe implements PipeTransform {
  private readonly jalali = inject(JalaliDateService);

  private lastValue: DateInput;
  private lastPattern?: string;
  private lastFormatter?: Formatter;
  private lastResult = '';

  transform(value: DateInput, pattern: string = JALALI_DATE_FORMAT): string {
    const formatter = this.jalali.formatter();
    if (formatter === this.lastFormatter && value === this.lastValue && pattern === this.lastPattern) {
      return this.lastResult;
    }
    this.lastFormatter = formatter;
    this.lastValue = value;
    this.lastPattern = pattern;
    this.lastResult = formatter(value, pattern);
    return this.lastResult;
  }
}
