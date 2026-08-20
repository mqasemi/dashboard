import { Platform } from '@angular/cdk/platform';
import { Injectable, computed, effect, inject, signal } from '@angular/core';

/**
 * The three shells the app can wear.
 *
 * - `sidebar` — `LayoutBasicComponent` with the aside visible. RTL puts it on the right.
 * - `top`     — same component with the aside hidden and a horizontal menu in the header.
 * - `portal`  — the chrome-free tile grid is the entry page; feature pages still open in the
 *               `sidebar` shell so navigation never dead-ends on a page with no menu.
 */
export type LayoutMode = 'sidebar' | 'top' | 'portal';

/** Every mode, in the order the switcher lists them. */
export const LAYOUT_MODES: readonly LayoutMode[] = ['sidebar', 'top', 'portal'];

export const DEFAULT_LAYOUT_MODE: LayoutMode = 'sidebar';

/** Where each mode sends a visitor who lands on `/`. */
export const PORTAL_URL = '/portal';
export const DASHBOARD_URL = '/dashboard';

interface LayoutModeMeta {
  /** Persian label for the switcher. */
  readonly label: string;
  /** `nz-icon` type; must be registered in `src/style-icons.ts`. */
  readonly icon: string;
}

export const LAYOUT_MODE_META: Readonly<Record<LayoutMode, LayoutModeMeta>> = {
  sidebar: { label: 'منوی کناری', icon: 'layout' },
  top: { label: 'منوی بالا', icon: 'menu' },
  portal: { label: 'پورتال کاشی‌ای', icon: 'appstore' }
};

const STORAGE_KEY = 'dashboard.layout-mode';

function isLayoutMode(value: string | null): value is LayoutMode {
  return value !== null && (LAYOUT_MODES as readonly string[]).includes(value);
}

/**
 * Holds the selected layout mode and persists it to `localStorage`.
 *
 * Deliberately *not* stored in `SettingsService.layout`: that object is a single JSON blob
 * read synchronously at construction, so a mode kept there could only be observed through
 * `settings.notify`, an RxJS stream. A signal lets `LayoutBasicComponent` derive its
 * `LayoutDefaultOptions` with `computed()` and lets the portal switch without a reload,
 * which is what CLAUDE.md's "read/applied automatically on app bootstrap" needs — the value
 * is read during the first injection, before any layout component renders.
 */
@Injectable({ providedIn: 'root' })
export class LayoutModeService {
  private readonly platform = inject(Platform);

  private readonly _mode = signal<LayoutMode>(this.readStored());

  /** The active layout mode. */
  readonly mode = this._mode.asReadonly();

  /** True while the aside should be hidden in favour of a horizontal header menu. */
  readonly isTopMenu = computed(() => this._mode() === 'top');

  /**
   * The route a visitor to `/` should land on. Only `portal` mode changes it; picking a tile
   * then navigates into the ordinary sidebar shell.
   */
  readonly startPage = computed(() => (this._mode() === 'portal' ? PORTAL_URL : DASHBOARD_URL));

  constructor() {
    effect(() => this.writeStored(this._mode()));
  }

  setMode(mode: LayoutMode): void {
    this._mode.set(mode);
  }

  private readStored(): LayoutMode {
    if (!this.platform.isBrowser) {
      return DEFAULT_LAYOUT_MODE;
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    return isLayoutMode(stored) ? stored : DEFAULT_LAYOUT_MODE;
  }

  private writeStored(mode: LayoutMode): void {
    if (this.platform.isBrowser) {
      localStorage.setItem(STORAGE_KEY, mode);
    }
  }
}
