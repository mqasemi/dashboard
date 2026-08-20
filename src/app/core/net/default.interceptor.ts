import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpResponseBase } from '@angular/common/http';
import { Injector, inject } from '@angular/core';
import { IGNORE_BASE_URL } from '@delon/theme';
import { environment } from '@env/environment';
import { Observable, of, throwError, mergeMap } from 'rxjs';

import { ReThrowHttpError, checkStatus, getAdditionalHeaders, toLogin } from './helper';
import { tryRefreshToken } from './refresh-token';

function handleData(injector: Injector, ev: HttpResponseBase, req: HttpRequest<any>, next: HttpHandlerFn): Observable<any> {
  checkStatus(injector, ev);
  // Common handling per status code
  switch (ev.status) {
    case 200:
      // Business-level error handling. The snippet below assumes the REST API always returns a
      // uniform envelope (i.e. the same shape whether the call succeeded or failed), e.g.:
      //  error:   { status: 1, msg: 'invalid parameter' }
      //  success: { status: 0, response: { } }
      // if (ev instanceof HttpResponse) {
      //   const body = ev.body;
      //   if (body && body.status !== 0) {
      //     const customError = req.context.get(CUSTOM_ERROR);
      //     if (customError) injector.get(NzMessageService).error(body.msg);
      //     return customError ? throwError(() => ({ body, _throw: true }) as ReThrowHttpError) : of({});
      //   } else {
      //     // Return the raw response body
      //     if (req.context.get(RAW_BODY) || ev.body instanceof Blob) {
      //       return of(ev);
      //     }
      //     // Unwrap `body` to `response` so callers no longer deal with the business status code
      //     return of(new HttpResponse({ ...ev, body: body.response } as any));
      //     // Or keep the full envelope intact
      //     return of(ev);
      //   }
      // }
      break;
    case 401:
      if (environment.api.refreshTokenEnabled && environment.api.refreshTokenType === 're-request') {
        return tryRefreshToken(injector, ev, req, next);
      }
      toLogin(injector);
      break;
    case 403:
    case 404:
    case 500:
      // goTo(injector, `/exception/${ev.status}?url=${req.urlWithParams}`);
      break;
    default:
      if (ev instanceof HttpErrorResponse) {
        console.warn(
          'Unknown error. This is usually caused by the backend not supporting CORS or by an invalid configuration. See https://ng-alain.com/docs/server',
          ev
        );
      }
      break;
  }
  if (ev instanceof HttpErrorResponse) {
    return throwError(() => ev);
  } else if ((ev as unknown as ReThrowHttpError)._throw === true) {
    return throwError(() => (ev as unknown as ReThrowHttpError).body);
  } else {
    return of(ev);
  }
}

export const defaultInterceptor: HttpInterceptorFn = (req, next) => {
  // Prefix every relative URL with the configured server base URL
  let url = req.url;
  if (!req.context.get(IGNORE_BASE_URL) && !url.startsWith('https://') && !url.startsWith('http://')) {
    const { baseUrl } = environment.api;
    url = baseUrl + (baseUrl.endsWith('/') && url.startsWith('/') ? url.substring(1) : url);
  }
  const newReq = req.clone({ url, setHeaders: getAdditionalHeaders(req.headers) });
  const injector = inject(Injector);

  return next(newReq).pipe(
    mergeMap(ev => {
      // Centralised handling of request errors
      if (ev instanceof HttpResponseBase) {
        return handleData(injector, ev, newReq, next);
      }
      // Otherwise pass through untouched
      return of(ev);
    })
    // catchError((err: HttpErrorResponse) => handleData(injector, err, newReq, next))
  );
};
