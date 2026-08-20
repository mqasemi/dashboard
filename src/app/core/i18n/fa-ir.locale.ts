import type { FullLocaleData } from '@delon/theme';

/**
 * Persian (fa-IR) locale for `@delon/*` components.
 *
 * `@delon/theme` ships no built-in `fa_IR` locale (only zh/en/tr/… are bundled), so the
 * full `FullLocaleData` contract is authored here. Keep this in sync with the upstream
 * `en_US` shape when upgrading `@delon/theme` — a missing key falls back to the raw
 * template string, not to English.
 */
export const faIR: FullLocaleData = {
  abbr: 'fa-IR',
  exception: {
    403: 'متأسفیم، شما به این صفحه دسترسی ندارید',
    404: 'متأسفیم، صفحه‌ای که به دنبال آن هستید وجود ندارد',
    500: 'متأسفیم، سرور با خطا مواجه شده است',
    backToHome: 'بازگشت به خانه'
  },
  noticeIcon: {
    emptyText: 'داده‌ای موجود نیست',
    clearText: 'پاک کردن'
  },
  reuseTab: {
    close: 'بستن زبانه',
    closeOther: 'بستن سایر زبانه‌ها',
    closeRight: 'بستن زبانه‌های سمت چپ',
    refresh: 'به‌روزرسانی'
  },
  tagSelect: {
    expand: 'نمایش بیشتر',
    collapse: 'نمایش کمتر'
  },
  miniProgress: {
    target: 'هدف: '
  },
  st: {
    total: '{{range[0]}} تا {{range[1]}} از {{total}} مورد',
    filterConfirm: 'تأیید',
    filterReset: 'بازنشانی'
  },
  sf: {
    submit: 'ثبت',
    reset: 'بازنشانی',
    search: 'جست‌وجو',
    edit: 'ذخیره',
    addText: 'افزودن',
    removeText: 'حذف',
    checkAllText: 'انتخاب همه',
    error: {
      'false schema': 'طرح بولی برابر false است',
      $ref: 'ارجاع {ref} قابل تشخیص نیست',
      additionalItems: 'نباید بیش از {limit} مورد داشته باشد',
      additionalProperties: 'نباید ویژگی اضافی داشته باشد',
      anyOf: 'باید با یکی از طرح‌های «anyOf» مطابقت داشته باشد',
      dependencies: 'وقتی ویژگی {property} موجود است، باید ویژگی {deps} نیز وجود داشته باشد',
      enum: 'باید یکی از مقادیر مجاز باشد',
      format: 'باید با قالب «{format}» مطابقت داشته باشد',
      type: 'باید از نوع {type} باشد',
      required: 'الزامی است',
      maxLength: 'نباید بیشتر از {limit} نویسه باشد',
      minLength: 'نباید کمتر از {limit} نویسه باشد',
      minimum: 'باید {comparison} {limit} باشد',
      formatMinimum: 'باید {comparison} {limit} باشد',
      maximum: 'باید {comparison} {limit} باشد',
      formatMaximum: 'باید {comparison} {limit} باشد',
      maxItems: 'نباید بیشتر از {limit} مورد داشته باشد',
      minItems: 'نباید کمتر از {limit} مورد داشته باشد',
      maxProperties: 'نباید بیشتر از {limit} ویژگی داشته باشد',
      minProperties: 'نباید کمتر از {limit} ویژگی داشته باشد',
      multipleOf: 'باید مضربی از {multipleOf} باشد',
      not: 'نباید با طرح «not» مطابقت داشته باشد',
      oneOf: 'باید دقیقاً با یکی از طرح‌های «oneOf» مطابقت داشته باشد',
      pattern: 'باید با الگوی «{pattern}» مطابقت داشته باشد',
      uniqueItems: 'نباید مورد تکراری داشته باشد (موارد ## {j} و {i} یکسان هستند)',
      custom: 'باید با قالب مطابقت داشته باشد',
      propertyNames: 'نام ویژگی «{propertyName}» نامعتبر است',
      patternRequired: 'باید ویژگی‌ای مطابق الگوی «{missingPattern}» داشته باشد',
      switch: 'اعتبارسنجی کلیدواژه «switch» ناموفق بود؛ حالت {caseIndex} رد شد',
      const: 'باید برابر مقدار ثابت باشد',
      contains: 'باید حداقل یک مورد معتبر داشته باشد',
      formatExclusiveMaximum: 'formatExclusiveMaximum باید بولی باشد',
      formatExclusiveMinimum: 'formatExclusiveMinimum باید بولی باشد',
      if: 'باید با طرح «{failingKeyword}» مطابقت داشته باشد'
    }
  },
  onboarding: {
    skip: 'رد کردن',
    prev: 'قبلی',
    next: 'بعدی',
    done: 'پایان'
  }
};
