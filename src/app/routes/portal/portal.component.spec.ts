import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DA_SERVICE_TOKEN } from '@delon/auth';
import { ALAIN_SETTING_DEFAULT, MenuService, SettingsService } from '@delon/theme';
import { provideNzIcons } from 'ng-zorro-antd/icon';

import { PortalComponent } from './portal.component';
import { ICONS } from '../../../style-icons';
import { ICONS_AUTO } from '../../../style-icons-auto';
import { LayoutModeService } from '../../core';

const STORAGE_KEY = 'dashboard.layout-mode';

/** Only the two members the portal footer touches; `ITokenService` declares `login_url` readonly. */
interface TokenStub {
  clear: jasmine.Spy;
  login_url: string;
}

describe('PortalComponent', () => {
  let fixture: ComponentFixture<PortalComponent>;
  let host: HTMLElement;
  let tokenService: TokenStub;

  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    tokenService = { clear: jasmine.createSpy('clear'), login_url: '/passport/login' };

    TestBed.configureTestingModule({
      providers: [
        ALAIN_SETTING_DEFAULT,
        provideRouter([]),
        // The tiles bind whatever the menu declares, so every menu icon must be registered or
        // `nz-icon` renders nothing — that is exactly the regression this catches.
        provideNzIcons([...ICONS, ...ICONS_AUTO]),
        { provide: DA_SERVICE_TOKEN, useValue: tokenService }
      ]
    });

    const settings = TestBed.inject(SettingsService);
    settings.setApp({ name: 'داشبورد مدیریت' });
    settings.setUser({ name: 'مدیر سیستم' });
    TestBed.inject(MenuService).add([
      {
        text: 'منوی اصلی',
        group: true,
        children: [{ text: 'داشبورد', link: '/dashboard', icon: 'anticon-dashboard' }]
      },
      {
        text: 'ابزارها',
        group: true,
        children: [{ text: 'قفل صفحه', link: '/passport/lock', icon: 'anticon-lock' }]
      }
    ]);

    fixture = TestBed.createComponent(PortalComponent);
    host = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  afterEach(() => localStorage.removeItem(STORAGE_KEY));

  function tiles(): HTMLAnchorElement[] {
    return Array.from(host.querySelectorAll<HTMLAnchorElement>('.portal__tile'));
  }

  it('should render one tile per menu entry, under its group heading', () => {
    const headings = Array.from(host.querySelectorAll<HTMLElement>('.portal__group-title')).map(el => el.textContent?.trim());

    expect(headings).toEqual(['منوی اصلی', 'ابزارها']);
    expect(tiles().length).toBe(2);
    expect(tiles()[0].getAttribute('href')).toBe('/dashboard');
    expect(tiles()[0].textContent?.trim()).toBe('داشبورد');
  });

  it('should render the menu icon on the tile', () => {
    // `nz-icon` puts `anticon-<type>` on its own host, so this is one element, not a descendant.
    expect(tiles()[0].querySelector('.portal__tile-icon.anticon-dashboard')).toBeTruthy();
  });

  it('should fall back to a placeholder icon for an entry without one', () => {
    TestBed.inject(MenuService).add([{ text: 'g', group: true, children: [{ text: 'بدون آیکن', link: '/x' }] }]);
    fixture.detectChanges();

    expect(tiles()[0].querySelector('.portal__tile-icon.anticon-appstore')).toBeTruthy();
  });

  it('should show the empty state rather than a bare grid when the menu is empty', () => {
    TestBed.inject(MenuService).add([]);
    fixture.detectChanges();

    expect(tiles().length).toBe(0);
    expect(host.querySelector('.portal__empty')).toBeTruthy();
  });

  it('should leave portal mode when the sidebar link is used', () => {
    const layout = TestBed.inject(LayoutModeService);
    layout.setMode('portal');

    fixture.componentInstance.useSidebarLayout();

    expect(layout.mode()).toBe('sidebar');
    expect(layout.startPage()).toBe('/dashboard');
  });

  it('should clear the token on sign-out', () => {
    fixture.componentInstance.logout();

    expect(tokenService.clear).toHaveBeenCalled();
  });
});
