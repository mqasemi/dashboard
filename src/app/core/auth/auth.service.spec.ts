import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { DA_SERVICE_TOKEN, ITokenService, provideAuth } from '@delon/auth';
import { of } from 'rxjs';

import { StartupService } from '../startup/startup.service';
import { AuthError, AuthToken, LoginRequest } from './models';
import { AuthService } from './auth.service';

const LOGIN_REQUEST: LoginRequest = {
  userName: 'admin',
  password: 'ng-alain.com',
  captcha: 'X7KQ'
};

const SUCCESS_RESPONSE = {
  msg: 'ok',
  user: {
    token: 'mock-jwt-token',
    name: 'admin',
    email: 'admin@example.com',
    id: 10000
  } satisfies AuthToken
};

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let tokenService: ITokenService;

  /** `load` must be replaceable per-test so success paths can assert the app-scope reload. */
  let startupLoad: jasmine.Spy;

  beforeEach(() => {
    startupLoad = jasmine.createSpy('load').and.returnValue(of(void 0));
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAuth(),
        { provide: StartupService, useValue: { load: startupLoad } }
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    tokenService = TestBed.inject(DA_SERVICE_TOKEN);
  });

  afterEach(() => {
    httpMock.verify();
    tokenService.clear();
  });

  /**
   * `_HttpClient` defers every request behind `delay(0)`, so each test runs inside `fakeAsync`
   * and ticks once to actually dispatch it against the testing backend.
   */

  it('should fetch a captcha and unwrap its image markup', fakeAsync(() => {
    let image = '';
    service.refreshCaptcha().subscribe(res => (image = res));
    tick();

    httpMock.expectOne('/captcha').flush({ image: '<svg viewBox="0 0 120 40"></svg>' } satisfies { image: string });

    expect(image).toBe('<svg viewBox="0 0 120 40"></svg>');
  }));

  it('should persist the token with an expiry and reload the app scope on success', fakeAsync(() => {
    service.login(LOGIN_REQUEST).subscribe();
    tick();

    const req = httpMock.expectOne('/login/account');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(LOGIN_REQUEST);
    req.flush(SUCCESS_RESPONSE);

    const stored = tokenService.get<AuthToken & Record<string, unknown>>();
    expect(stored?.['token']).toBe('mock-jwt-token');
    expect(stored?.['expired']).toBeGreaterThan(Date.now());
    expect(startupLoad).toHaveBeenCalledTimes(1);
    expect(service.submitting()).toBeFalse();
  }));

  it('should raise an AuthError carrying the server message when credentials are rejected', fakeAsync(() => {
    let failure: unknown;
    service.login(LOGIN_REQUEST).subscribe({ error: err => (failure = err) });
    tick();

    httpMock.expectOne('/login/account').flush({ msg: 'نام کاربری یا گذرواژه نامعتبر است.' });

    expect(failure instanceof AuthError).toBeTrue();
    expect((failure as AuthError).message).toBe('نام کاربری یا گذرواژه نامعتبر است.');
    // Nothing may be persisted for a rejected login (delon's store answers `{}` when empty)
    expect(tokenService.get()?.['token']).toBeUndefined();
    expect(startupLoad).not.toHaveBeenCalled();
    expect(service.submitting()).toBeFalse();
  }));

  it('should flag submitting only while the login request is in flight', fakeAsync(() => {
    service.login(LOGIN_REQUEST).subscribe();
    expect(service.submitting()).toBeTrue();

    tick();
    httpMock.expectOne('/login/account').flush(SUCCESS_RESPONSE);
    expect(service.submitting()).toBeFalse();
  }));
});
