import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NumberFormatService } from '@core';

import { JalaliDatePipe } from './jalali-date.pipe';
import { PersianDigitsPipe } from './persian-digits.pipe';

const STORAGE_KEY = 'dashboard.persian-digits';

@Component({
  template: `<span>{{ date | jalaliDate }}</span
    ><em>{{ 2026 | persianDigits }}</em>`,
  imports: [JalaliDatePipe, PersianDigitsPipe]
})
class HostComponent {
  date = new Date(2026, 7, 18);
}

describe('presentation pipes', () => {
  afterEach(() => localStorage.removeItem(STORAGE_KEY));

  it('should render Jalali dates and Persian digits by default', () => {
    localStorage.removeItem(STORAGE_KEY);
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('span')!.textContent).toBe('۱۴۰۵/۰۵/۲۷');
    expect(el.querySelector('em')!.textContent).toBe('۲۰۲۶');
  });

  it('should re-render both pipes when the digit toggle flips', () => {
    localStorage.removeItem(STORAGE_KEY);
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    TestBed.inject(NumberFormatService).toggle();
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;

    // This is what forces both pipes to be impure: the toggle is not a pipe argument, so pure-pipe
    // memoisation would skip `transform()` entirely and keep serving the Persian-digit string.
    expect(el.querySelector('span')!.textContent).toBe('1405/05/27');
    expect(el.querySelector('em')!.textContent).toBe('2026');
  });

  it('should render an empty string for an absent date', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.date = null as unknown as Date;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('span').textContent).toBe('');
  });
});
