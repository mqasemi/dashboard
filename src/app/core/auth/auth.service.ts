import { HttpContext } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { ReuseTabService } from '@delon/abc/reuse-tab';
import { ALLOW_ANONYMOUS, DA_SERVICE_TOKEN } from '@delon/auth';
import { _HttpClient } from '@delon/theme';
import { Observable, finalize, map, switchMap, tap } from 'rxjs';

import { AuthError, AuthResponse, AuthToken, CaptchaResponse, LoginRequest } from './models';
import { StartupService } from '../startup/startup.service';

/** Mock TTL until the real API returns a real expiry; mirrors the scaffold's 5-minute token. */
const TOKEN_TTL_MS = 5 * 60 * 1000;

/** Login and captcha endpoints are reachable without a session. */
function anonymous(): HttpContext {
  return new HttpContext().set(ALLOW_ANONYMOUS, true);
}

/**
 * Authentication gateway: login against the (mock) API, captcha issuance and token persistence.
 *
 * Components stay presentation-focused — they bind to `submitting()` for spinners and subscribe
 * to `login()`; everything else (token storage, app-scope reload, route-reuse invalidation)
 * happens here so it survives refactors of the UI.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(_HttpClient);
  private readonly tokenService = inject(DA_SERVICE_TOKEN);
  private readonly startupSrv = inject(StartupService);
  private readonly reuseTabService = inject(ReuseTabService, { optional: true });

  /** `true` while a login request is in flight; drives the submit button's spinner. */
  readonly submitting = signal(false);

  /** Fetches a fresh captcha rendering from the API. */
  refreshCaptcha(): Observable<string> {
    return this.http.get('/captcha', null, { context: anonymous() }).pipe(map((res: CaptchaResponse) => res.image));
  }

  /**
   * Attempts a login. Emits once on success (token persisted, app scope reloaded) or errors with
   * an `AuthError` whose message is ready to display.
   */
  login(request: LoginRequest): Observable<void> {
    this.submitting.set(true);
    return this.http.post('/login/account', request, null, { context: anonymous() }).pipe(
      map((res: AuthResponse): void => {
        if (res.msg !== 'ok' || !res.user) {
          throw new AuthError(res.msg);
        }
        const token: AuthToken = { ...res.user, expired: Date.now() + TOKEN_TTL_MS };
        this.tokenService.set(token);
      }),
      // App data is always assumed to depend on the current user's scope
      switchMap(() => this.startupSrv.load()),
      tap(() => this.reuseTabService?.clear()),
      finalize(() => this.submitting.set(false))
    );
  }

  /** Clears the local session (used by logout flows). */
  logout(): void {
    this.tokenService.clear();
  }
}
