import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { DA_SERVICE_TOKEN } from '@delon/auth';
import { ALAIN_SETTING_DEFAULT, MenuService } from '@delon/theme';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';

import { LayoutBasicComponent } from './basic.component';
import { ICONS } from '../../../style-icons';
import { ICONS_AUTO } from '../../../style-icons-auto';
import { LayoutModeService } from '../../core';

const STORAGE_KEY = 'dashboard.layout-mode';

/**
 * Covers the one thing this component decides for itself: which shell the persisted layout mode
 * produces. The chrome inside `layout-default` belongs to @delon and is not re-tested here.
 */
describe('LayoutBasicComponent', () => {
  let fixture: ComponentFixture<LayoutBasicComponent>;
  let host: HTMLElement;

  /** The mode is read in a field initialiser, so `localStorage` must be seeded before this runs. */
  function boot(): void {
    TestBed.configureTestingModule({
      providers: [
        ALAIN_SETTING_DEFAULT,
        provideRouter([]),
        provideNoopAnimations(),
        provideNzIcons([...ICONS, ...ICONS_AUTO]),
        // `NzModalService` is not `providedIn: 'root'`; the header's clear-storage widget injects it.
        // `provideAlain()` pulls it in via the same module, so this mirrors the real app.
        importProvidersFrom(NzModalModule),
        { provide: DA_SERVICE_TOKEN, useValue: { clear: jasmine.createSpy('clear'), login_url: '/passport/login' } }
      ]
    });

    TestBed.inject(MenuService).add([
      { text: 'منوی اصلی', group: true, children: [{ text: 'داشبورد', link: '/dashboard', icon: 'anticon-dashboard' }] }
    ]);

    fixture = TestBed.createComponent(LayoutBasicComponent);
    host = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  }

  beforeEach(() => localStorage.removeItem(STORAGE_KEY));
  afterEach(() => localStorage.removeItem(STORAGE_KEY));

  it('should keep the sidebar in the default mode', () => {
    boot();

    expect(fixture.componentInstance.options().hideAside).toBeFalse();
    expect(host.querySelector('.alain-default__aside')).toBeTruthy();
    expect(host.querySelector('header-top-menu')).toBeNull();
  });

  it('should hide the sidebar and show the horizontal menu in top mode', () => {
    localStorage.setItem(STORAGE_KEY, 'top');

    boot();

    expect(fixture.componentInstance.options().hideAside).toBeTrue();
    expect(host.querySelector('.alain-default__aside')).toBeNull();
    expect(host.querySelector('header-top-menu')).toBeTruthy();
  });

  it('should render the menu entries in the horizontal bar', () => {
    localStorage.setItem(STORAGE_KEY, 'top');

    boot();

    const entries = Array.from(host.querySelectorAll<HTMLElement>('header-top-menu .alain-default__top-menu-item')).map(el =>
      el.textContent?.trim()
    );

    expect(entries).toEqual(['داشبورد']);
  });

  it('should switch shells when the mode changes at runtime', () => {
    boot();

    TestBed.inject(LayoutModeService).setMode('top');
    fixture.detectChanges();

    expect(fixture.componentInstance.options().hideAside).toBeTrue();
    expect(host.querySelector('.alain-default__aside')).toBeNull();
  });

  it('should point the logo at the portal in portal mode', () => {
    localStorage.setItem(STORAGE_KEY, 'portal');

    boot();

    expect(fixture.componentInstance.options().logoLink).toBe('/portal');
  });

  it('should only offer the mobile menu drawer in top mode', () => {
    boot();

    // Scoped to a direct child: `setting-drawer` renders an `nz-drawer` of its own outside
    // production builds, so a bare `nz-drawer` query would always match.
    const navDrawer = (): Element | null => host.querySelector(':scope > nz-drawer');

    expect(fixture.componentInstance.navDrawer()).toBeFalse();
    expect(navDrawer()).toBeNull();

    TestBed.inject(LayoutModeService).setMode('top');
    fixture.detectChanges();

    expect(navDrawer()).toBeTruthy();
  });
});
