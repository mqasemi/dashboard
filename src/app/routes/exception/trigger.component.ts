import { Component, inject } from '@angular/core';
import { DA_SERVICE_TOKEN } from '@delon/auth';
import { _HttpClient } from '@delon/theme';
import { PersianDigitsPipe } from '@shared';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';

@Component({
  selector: 'exception-trigger',
  template: `
    <div class="pt-lg">
      <nz-card>
        @for (t of types; track $index) {
          <button (click)="go(t)" nz-button nzDanger>خطای {{ t | persianDigits }}</button>
        }
        <button nz-button nzType="link" (click)="refresh()">آزمون تازه‌سازی توکن</button>
      </nz-card>
    </div>
  `,
  imports: [NzCardModule, NzButtonModule, PersianDigitsPipe]
})
export class ExceptionTriggerComponent {
  private readonly http = inject(_HttpClient);
  private readonly tokenService = inject(DA_SERVICE_TOKEN);

  types = [401, 403, 404, 500];

  go(type: number): void {
    this.http.get(`/api/${type}`).subscribe();
  }

  refresh(): void {
    this.tokenService.set({ token: 'invalid-token' });
    // Requires a real backend endpoint; this cannot be simulated through the mock layer
    this.http.post(`https://localhost:5001/auth`).subscribe({
      next: res => console.warn('succeeded', res),
      error: err => {
        console.log('final result failed', err);
      }
    });
  }
}
