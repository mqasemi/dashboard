import { toLatinDigits, toPersianDigits } from './persian-digits';

describe('persian-digits', () => {
  describe('toPersianDigits', () => {
    it('should shape Latin digits', () => {
      expect(toPersianDigits('0123456789')).toBe('۰۱۲۳۴۵۶۷۸۹');
    });

    it('should leave non-digit characters untouched', () => {
      expect(toPersianDigits('1,024 KB')).toBe('۱,۰۲۴ KB');
      expect(toPersianDigits('نسخهٔ 2.1')).toBe('نسخهٔ ۲.۱');
    });

    it('should return an empty string unchanged', () => {
      expect(toPersianDigits('')).toBe('');
    });
  });

  describe('toLatinDigits', () => {
    it('should convert Persian digits back to Latin', () => {
      expect(toLatinDigits('۰۱۲۳۴۵۶۷۸۹')).toBe('0123456789');
    });

    it('should convert Arabic-Indic digits back to Latin', () => {
      expect(toLatinDigits('٠١٢٣٤٥٦٧٨٩')).toBe('0123456789');
    });

    it('should handle mixed scripts', () => {
      expect(toLatinDigits('۱۴۰۵/05/۲۷')).toBe('1405/05/27');
    });

    it('should round-trip with toPersianDigits', () => {
      expect(toLatinDigits(toPersianDigits('1405-05-27T14:30:00'))).toBe('1405-05-27T14:30:00');
    });
  });
});
