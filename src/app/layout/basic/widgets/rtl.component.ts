import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import { RTLService } from '@delon/theme';
import { NzIconModule } from 'ng-zorro-antd/icon';

/**
 * Header entry that toggles the page text direction.
 *
 * Primarily a development/verification aid: the app defaults to RTL (see
 * `core/i18n/direction.ts`) and `RTLService` persists whatever the user picks.
 */
@Component({
  selector: 'header-rtl',
  template: `
    <nz-icon [nzType]="rtl.nextDir === 'rtl' ? 'border-right' : 'border-left'" />
    {{ rtl.nextDir === 'rtl' ? 'چیدمان راست‌به‌چپ' : 'چیدمان چپ‌به‌راست' }}
  `,
  host: {
    '[class.flex-1]': 'true'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NzIconModule]
})
export class HeaderRTLComponent {
  readonly rtl = inject(RTLService);

  @HostListener('click')
  toggleDirection(): void {
    this.rtl.toggle();
  }
}
