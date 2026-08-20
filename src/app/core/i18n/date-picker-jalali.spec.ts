import { registerLocaleData } from '@angular/common';
import { default as ngLang } from '@angular/common/locales/fa';
import { Component, LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { faIR as dateLang } from 'date-fns-jalali/locale';
import { CandyDate } from 'ng-zorro-antd/core/time';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NZ_DATE_LOCALE, provideNzI18n } from 'ng-zorro-antd/i18n';

import { JALALI_ZORRO_LANG, provideJalaliCalendar } from './jalali-calendar';

registerLocaleData(ngLang);

/** 2026-08-19 Gregorian === 1405-05-28 Jalali (چهارشنبه ۲۸ مرداد ۱۴۰۵). */
const FIXED_DATE = new Date(2026, 7, 19);

@Component({
  template: `<nz-date-picker [(ngModel)]="value" [nzOpen]="true" />`,
  imports: [NzDatePickerModule, FormsModule]
})
class HostComponent {
  value = FIXED_DATE;
}

/** Pulls the strings a user actually sees out of the open panel. */
function readPanel(): {
  yearBtn: string;
  monthBtn: string;
  weekdays: string[];
  selectedCell: string;
  firstRow: string[];
  input: string;
} {
  const panel = document.querySelector('.ant-picker-dropdown')!;
  const text = (el: Element | null): string => (el?.textContent ?? '').trim();
  const all = (sel: string): string[] => Array.from(panel.querySelectorAll(sel)).map(e => text(e));

  return {
    yearBtn: text(panel.querySelector('.ant-picker-header-year-btn')),
    monthBtn: text(panel.querySelector('.ant-picker-header-month-btn')),
    weekdays: all('.ant-picker-content thead th'),
    selectedCell: text(panel.querySelector('.ant-picker-cell-selected .ant-picker-cell-inner')),
    firstRow: Array.from(panel.querySelectorAll('.ant-picker-content tbody tr')[0].querySelectorAll('.ant-picker-cell-inner')).map(e =>
      text(e)
    ),
    input: (document.querySelector('.ant-picker-input input') as HTMLInputElement).value
  };
}

describe('nz-date-picker Jalali rendering', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideNoopAnimations(),
        provideNzI18n(JALALI_ZORRO_LANG),
        provideJalaliCalendar(),
        { provide: LOCALE_ID, useValue: 'fa-IR' },
        { provide: NZ_DATE_LOCALE, useValue: dateLang }
      ]
    });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach(el => el.remove()));

  it('DIAGNOSTIC: dump every string the picker renders', () => {
    const panel = readPanel();

    console.log(`\n=== nz-date-picker rendered output for ${FIXED_DATE.toDateString()} ===\n${JSON.stringify(panel, null, 2)}\n`);
    expect(panel.yearBtn).toBeTruthy();
  });

  it('should render the header year on the Jalali calendar', () => {
    expect(readPanel().yearBtn).toBe('1405');
  });

  it('should render the header month spelled out in Persian', () => {
    expect(readPanel().monthBtn).toBe('مرداد');
  });

  it('should render the selected day as its Jalali day-of-month', () => {
    expect(readPanel().selectedCell).toBe('28');
  });

  it('should start the grid on the Saturday of the Jalali month, in Jalali day numbers', () => {
    // 1 Mordad 1405 is a Thursday, and `fa_IR` starts the week on Saturday, so the first row runs
    // 27–31 Tir (the leading days from the previous month) then 1–2 Mordad.
    expect(readPanel().firstRow).toEqual(['27', '28', '29', '30', '31', '1', '2']);
  });

  it('should render the input value as a Jalali date', () => {
    expect(readPanel().input).toBe('1405-05-28');
  });

  it('should not corrupt the value when a day cell is clicked', () => {
    // `DateTableComponent.changeValueFromInside()` round-trips the clicked date through
    // `setYear(getYear()).setMonth(getMonth()).setDate(getDate())`. When the accessors and the
    // mutators disagreed on a calendar that round-trip landed in 2647.
    const cells = Array.from(document.querySelectorAll<HTMLElement>('.ant-picker-cell-in-view .ant-picker-cell-inner'));
    const target = cells.find(el => el.textContent?.trim() === '30')!;
    target.click();
    fixture.detectChanges();

    // 30 Mordad 1405 === 2026-08-21.
    expect(fixture.componentInstance.value.getFullYear()).toBe(2026);
    expect(fixture.componentInstance.value.getMonth()).toBe(7);
    expect(fixture.componentInstance.value.getDate()).toBe(21);
  });
});

describe('patchCandyDateToJalali', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideJalaliCalendar()] });
    TestBed.inject(LOCALE_ID); // force injector creation so the initializer runs
  });

  it('should report Jalali year, month and day from the accessors', () => {
    const date = new CandyDate(FIXED_DATE);

    expect(date.getYear()).toBe(1405);
    expect(date.getMonth()).toBe(4); // Mordad, zero-based
    expect(date.getDate()).toBe(28);
  });

  it('should make the accessor/mutator round-trip an identity', () => {
    const date = new CandyDate(FIXED_DATE);

    const roundTripped = date.setYear(date.getYear()).setMonth(date.getMonth()).setDate(date.getDate());

    expect(roundTripped.nativeDate.getTime()).toBe(FIXED_DATE.getTime());
  });

  it('should keep addDays coherent across a Jalali month boundary', () => {
    // 31 Mordad is the last day of the month; +1 day is 1 Shahrivar.
    const lastOfMordad = new CandyDate(new Date(2026, 7, 22));

    expect(lastOfMordad.getDate()).toBe(31);
    expect(lastOfMordad.addDays(1).getMonth()).toBe(5); // Shahrivar
    expect(lastOfMordad.addDays(1).getDate()).toBe(1);
  });

  it('should leave the weekday accessor on the native calendar', () => {
    // Weekdays are calendar-independent; 2026-08-19 is a Wednesday.
    expect(new CandyDate(FIXED_DATE).getDay()).toBe(3);
  });
});
