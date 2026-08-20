import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JALALI_LONG_FORMAT, JalaliDateService } from '@core';
import { PageHeaderModule } from '@delon/abc/page-header';
import { JalaliDatePipe, PersianDigitsPipe } from '@shared';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzGridModule } from 'ng-zorro-antd/grid';

/**
 * Placeholder dashboard. Step 5 replaces this with the real stat cards and charts;
 * for now it doubles as a live check that the Jalali calendar, Persian digits and the
 * ISO-at-the-service-boundary rule all behave.
 */
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, PageHeaderModule, NzCardModule, NzGridModule, NzDatePickerModule, JalaliDatePipe, PersianDigitsPipe]
})
export class DashboardComponent {
  private readonly jalali = inject(JalaliDateService);

  readonly longFormat = JALALI_LONG_FORMAT;
  readonly today = new Date();
  readonly picked = signal<Date | null>(null);

  /** What a service would actually send to the API: plain Gregorian ISO. */
  readonly pickedISO = computed(() => this.jalali.toISODate(this.picked()));
}
