import { Platform } from '@angular/cdk/platform';
import { Injectable, computed, effect, inject, signal } from '@angular/core';

import { toPersianDigits } from './persian-digits';

const STORAGE_KEY = 'dashboard.persian-digits';

/**
 * Controls whether numbers are rendered with Persian digits (`۱۲۳`) or Latin digits (`123`).
 *
 * CLAUDE.md requires Persian digit display to be toggleable, so the choice is a signal that
 * pipes read at render time and is persisted to `localStorage` across reloads. Defaults to
 * enabled.
 */
@Injectable({ providedIn: 'root' })
export class NumberFormatService {
  private readonly platform = inject(Platform);

  private readonly _persianDigits = signal<boolean>(this.readStored());

  /** Whether Persian digits are currently enabled. */
  readonly persianDigits = this._persianDigits.asReadonly();

  /**
   * The digit shaper to apply to an already-formatted string. Reading this in a template
   * registers a dependency on the toggle, so views re-render when it flips.
   */
  readonly shape = computed<(value: string) => string>(() => (this._persianDigits() ? toPersianDigits : (value: string) => value));

  constructor() {
    effect(() => this.writeStored(this._persianDigits()));
  }

  /** Enable or disable Persian digits. */
  setPersianDigits(enabled: boolean): void {
    this._persianDigits.set(enabled);
  }

  /** Flip between Persian and Latin digits. */
  toggle(): void {
    this._persianDigits.update(v => !v);
  }

  private readStored(): boolean {
    if (!this.platform.isBrowser) {
      return true;
    }
    return localStorage.getItem(STORAGE_KEY) !== 'false';
  }

  private writeStored(enabled: boolean): void {
    if (this.platform.isBrowser) {
      localStorage.setItem(STORAGE_KEY, String(enabled));
    }
  }
}
