import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import { NumberFormatService } from '@core';
import { NzIconModule } from 'ng-zorro-antd/icon';

/**
 * Header entry that switches numbers between Persian (`۱۲۳`) and Latin (`123`) digits.
 *
 * Backs the "Persian digit display should be toggleable" requirement; the choice is persisted
 * by `NumberFormatService`.
 */
@Component({
  selector: 'header-persian-digits',
  template: `
    <nz-icon nzType="field-number" />
    {{ numberFormat.persianDigits() ? 'نمایش اعداد لاتین' : 'نمایش اعداد فارسی' }}
  `,
  host: {
    '[class.flex-1]': 'true'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NzIconModule]
})
export class HeaderPersianDigitsComponent {
  readonly numberFormat = inject(NumberFormatService);

  @HostListener('click')
  toggle(): void {
    this.numberFormat.toggle();
  }
}
