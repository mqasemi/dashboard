import { JalaliDatePipe } from './jalali-date.pipe';
import { PersianDigitsPipe } from './persian-digits.pipe';

export * from './jalali-date.pipe';
export * from './persian-digits.pipe';

/** Standalone pipes exposed through `SHARED_IMPORTS`. */
export const SHARED_PIPES = [JalaliDatePipe, PersianDigitsPipe];
