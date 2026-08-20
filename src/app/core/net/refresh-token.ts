import { HttpClient, HttpHandlerFn, HttpRequest, HttpResponseBase } from '@angular/common/http';
import { EnvironmentProviders, Injector, inject, provideAppInitializer } from '@angular/core';
import { DA_SERVICE_TOKEN } from '@delon/auth';
import { BehaviorSubject, Observable, catchError, filter, switchMap, take, throwError } from 'rxjs';

import { toLogin } from './helper';

let refreshToking = false;
let refreshToken$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

/**
 * Re-attach the refreshed token.
 *
 * > Requests that were already in flight do not pass through `@delon/auth` again, so the new
 * > token has to be attached manually here to match your backend's expectations.
 */
function reAttachToken(injector: Injector, req: HttpRequest<any>): HttpRequest<any> {
  const token = injector.get(DA_SERVICE_TOKEN).get()?.token;
  return req.clone({
    setHeaders: {
      token: `Bearer ${token}`
    }
  });
}

function refreshTokenRequest(injector: Injector): Observable<any> {
  const model = injector.get(DA_SERVICE_TOKEN).get();
  return injector.get(HttpClient).post(`/api/auth/refresh`, { headers: { refresh_token: model?.['refresh_token'] || '' } });
}

/**
 * Refresh strategy 1: refresh the token in response to a 401.
 */
export function tryRefreshToken(injector: Injector, ev: HttpResponseBase, req: HttpRequest<any>, next: HttpHandlerFn): Observable<any> {
  // 1. If the failing request *is* the refresh call, the refresh token is dead too — go to login
  if ([`/api/auth/refresh`].some(url => req.url.includes(url))) {
    toLogin(injector);
    return throwError(() => ev);
  }
  // 2. If `refreshToking` is true a refresh is already in flight; queue this request until the
  //    result arrives, then replay it. This is what prevents concurrent refresh calls.
  if (refreshToking) {
    return refreshToken$.pipe(
      filter(v => !!v),
      take(1),
      switchMap(() => next(reAttachToken(injector, req)))
    );
  }
  // 3. Start a refresh
  refreshToking = true;
  refreshToken$.next(null);

  return refreshTokenRequest(injector).pipe(
    switchMap(res => {
      // Release the queued requests
      refreshToking = false;
      refreshToken$.next(res);
      // Persist the new token
      injector.get(DA_SERVICE_TOKEN).set(res);
      // Replay the original request
      return next(reAttachToken(injector, req));
    }),
    catchError(err => {
      refreshToking = false;
      toLogin(injector);
      return throwError(() => err);
    })
  );
}

function buildAuthRefresh(injector: Injector): void {
  const tokenSrv = injector.get(DA_SERVICE_TOKEN);
  tokenSrv.refresh
    .pipe(
      filter(() => !refreshToking),
      switchMap(res => {
        console.log(res);
        refreshToking = true;
        return refreshTokenRequest(injector);
      })
    )
    .subscribe({
      next: res => {
        // TODO: Mock expired value
        res.expired = +new Date() + 1000 * 60 * 5;
        refreshToking = false;
        tokenSrv.set(res);
      },
      error: () => toLogin(injector)
    });
}

/**
 * Refresh strategy 2: use `@delon/auth`'s `refresh` hook. Requires registering
 * `provideBindAuthRefresh` in `app.config.ts`.
 */
export function provideBindAuthRefresh(): EnvironmentProviders[] {
  return [
    provideAppInitializer(() => {
      const initializerFn = (
        (injector: Injector) => () =>
          buildAuthRefresh(injector)
      )(inject(Injector));
      return initializerFn();
    })
  ];
}
