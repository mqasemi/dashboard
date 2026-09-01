import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService, AuthError } from '@core';
import { DA_SERVICE_TOKEN } from '@delon/auth';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';

const DEFAULT_ERROR_MESSAGE = 'ورود ناموفق بود؛ لطفاً دوباره تلاش کنید.';

@Component({
  selector: 'passport-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, NzAlertModule, NzFormModule, NzInputModule, NzButtonModule, NzIconModule, NzTooltipModule]
})
export class UserLoginComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly tokenService = inject(DA_SERVICE_TOKEN);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly destroyRef = inject(DestroyRef);

  form = this.fb.group({
    userName: ['', [Validators.required]],
    password: ['', [Validators.required]],
    captcha: ['', [Validators.required]]
  });

  /** Last error returned by the API; rendered as a dismissible alert above the form. */
  readonly error = signal<string | null>(null);
  /** Trusted SVG markup of the current captcha image. */
  readonly captchaSvg = signal<SafeHtml | null>(null);
  readonly passwordVisible = signal(false);
  /** Exposed for the template; the spinner state lives in the service so it survives navigation. */
  readonly submitting = this.auth.submitting;

  ngOnInit(): void {
    this.loadCaptcha();
  }

  togglePasswordVisibility(): void {
    this.passwordVisible.update(visible => !visible);
  }

  reloadCaptcha(): void {
    this.form.controls.captcha.reset();
    this.loadCaptcha();
  }

  submit(): void {
    if (this.submitting()) {
      return;
    }
    const controls = [this.form.controls.userName, this.form.controls.password, this.form.controls.captcha];
    for (const control of controls) {
      control.markAsDirty({ onlySelf: true });
      control.updateValueAndValidity({ onlySelf: true });
    }
    if (this.form.invalid) {
      return;
    }

    this.error.set(null);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => this.navigateAfterLogin(),
      error: (err: unknown) => {
        this.error.set(err instanceof AuthError ? err.message : DEFAULT_ERROR_MESSAGE);
        // The mock (like any real captcha service) rotates the code after a failed attempt
        this.reloadCaptcha();
      }
    });
  }

  private loadCaptcha(): void {
    this.auth
      .refreshCaptcha()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: svg => this.captchaSvg.set(this.sanitizer.bypassSecurityTrustHtml(svg)),
        // The box stays clickable so the user can simply try again
        error: () => this.captchaSvg.set(null)
      });
  }

  private navigateAfterLogin(): void {
    let url = this.tokenService.referrer?.url || '/';
    if (url.includes('/passport')) {
      url = '/';
    }
    void this.router.navigateByUrl(url);
  }
}
