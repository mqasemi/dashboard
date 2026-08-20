import { HttpHeaders, HttpResponseBase } from '@angular/common/http';
import { Injector, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN } from '@delon/auth';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { NzNotificationService } from 'ng-zorro-antd/notification';

export interface ReThrowHttpError {
  body: any;
  _throw: true;
}

export const CODEMESSAGE: Record<number, string> = {
  200: 'درخواست با موفقیت انجام شد.',
  201: 'داده با موفقیت ایجاد یا ویرایش شد.',
  202: 'درخواست در صف پردازش قرار گرفت.',
  204: 'داده با موفقیت حذف شد.',
  400: 'درخواست ارسالی نامعتبر است و عملیاتی روی داده‌ها انجام نشد.',
  401: 'دسترسی ندارید (توکن، نام کاربری یا گذرواژه نامعتبر است).',
  403: 'شما احراز هویت شده‌اید اما اجازهٔ دسترسی به این منبع را ندارید.',
  404: 'منبع درخواستی یافت نشد.',
  406: 'قالب درخواستی پشتیبانی نمی‌شود.',
  410: 'منبع درخواستی به‌طور دائم حذف شده است.',
  422: 'هنگام ایجاد رکورد، خطای اعتبارسنجی رخ داد.',
  500: 'خطای سرور رخ داد؛ لطفاً وضعیت سرور را بررسی کنید.',
  502: 'خطای درگاه (Gateway).',
  503: 'سرویس در دسترس نیست؛ سرور موقتاً پرمشغله یا در حال نگهداری است.',
  504: 'زمان پاسخ درگاه به پایان رسید.'
};

export function goTo(injector: Injector, url: string): void {
  setTimeout(() => injector.get(Router).navigateByUrl(url));
}

export function toLogin(injector: Injector): void {
  injector.get(NzNotificationService).error('وارد نشده‌اید یا نشست شما منقضی شده است. لطفاً دوباره وارد شوید.', '');
  goTo(injector, injector.get(DA_SERVICE_TOKEN).login_url!);
}

export function getAdditionalHeaders(headers?: HttpHeaders): Record<string, string> {
  const res: Record<string, string> = {};
  const lang = inject(ALAIN_I18N_TOKEN).currentLang;
  if (!headers?.has('Accept-Language') && lang) {
    res['Accept-Language'] = lang;
  }

  return res;
}

export function checkStatus(injector: Injector, ev: HttpResponseBase): void {
  if ((ev.status >= 200 && ev.status < 300) || ev.status === 401) {
    return;
  }

  const errortext = CODEMESSAGE[ev.status] || ev.statusText;
  injector.get(NzNotificationService).error(`خطای درخواست ${ev.status}: ${ev.url}`, errortext);
}
