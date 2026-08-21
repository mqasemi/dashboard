import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Router, provideRouter } from '@angular/router';
import { Menu, MenuService } from '@delon/theme';
import { provideNzIcons } from 'ng-zorro-antd/icon';

import { HeaderTopMenuComponent } from './top-menu.component';
import { ICONS } from '../../../../style-icons';
import { ICONS_AUTO } from '../../../../style-icons-auto';

/** The menu the app ships, trimmed to two error pages — depth is what matters here, not breadth. */
const APP_MENU: Menu[] = [
  { text: 'منوی اصلی', group: true, children: [{ text: 'داشبورد', link: '/dashboard', icon: 'anticon-dashboard' }] },
  {
    text: 'ابزارها',
    group: true,
    children: [
      {
        text: 'صفحات خطا',
        icon: 'anticon-warning',
        children: [
          { text: 'دسترسی غیرمجاز', link: '/exception/403' },
          { text: 'صفحه یافت نشد', link: '/exception/404' }
        ]
      },
      { text: 'قفل صفحه', link: '/passport/lock', icon: 'anticon-lock' }
    ]
  }
];

/**
 * `menu-tree.spec.ts` proves the tree keeps its shape; this proves the template renders that shape,
 * which is the half a data-only test cannot see. Dropdown levels live in CDK overlays attached to
 * `document.body`, so the assertions query there rather than through the fixture.
 */
describe('HeaderTopMenuComponent', () => {
  let fixture: ComponentFixture<HeaderTopMenuComponent>;
  let host: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        // Routes without components: enough for `routerLink` to resolve and for the URL to change.
        provideRouter([
          { path: 'exception/403', children: [] },
          { path: 'passport/lock', children: [] }
        ]),
        provideNoopAnimations(),
        provideNzIcons([...ICONS, ...ICONS_AUTO])
      ]
    });
    TestBed.inject(MenuService).add(APP_MENU);
  });

  /**
   * `nz-dropdown` wires its hover pipeline in `ngAfterViewInit` and gates it behind
   * `auditTime(150)`, so the fixture has to be built inside the fake-async zone for `tick()` to
   * reach those timers — built in a plain `beforeEach`, the dropdown would never open.
   */
  function boot(): void {
    fixture = TestBed.createComponent(HeaderTopMenuComponent);
    host = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  }

  function hover(el: Element): void {
    el.dispatchEvent(new MouseEvent('mouseenter'));
    tick(300);
    fixture.detectChanges();
  }

  function texts(nodes: Element[]): Array<string | undefined> {
    return nodes.map(el => el.textContent?.replace(/\s+/g, ' ').trim());
  }

  function barItems(): HTMLElement[] {
    return Array.from(host.querySelectorAll<HTMLElement>('.alain-default__top-menu-item'));
  }

  /**
   * Entries of one dropdown level. Every level renders through `header-top-menu-nodes`, so the
   * query steps through it; nested levels are separate overlays, keyed by `ant-dropdown-menu-sub`.
   */
  function levelItems(sub: boolean): Element[] {
    const selector = sub ? '.ant-dropdown-menu-sub' : '.ant-dropdown-menu:not(.ant-dropdown-menu-sub)';
    const level = document.querySelector(selector);
    return Array.from(level?.querySelectorAll(':scope > header-top-menu-nodes > li') ?? []);
  }

  it('should put both top-level entries on the bar', () => {
    boot();

    expect(texts(barItems())).toEqual(['داشبورد', 'ابزارها']);
  });

  it('should hold the branch and its sibling leaf together in the parent dropdown', fakeAsync(() => {
    boot();

    hover(barItems()[1]);
    const opened = levelItems(false);

    expect(texts(opened)).toEqual(['صفحات خطا', 'قفل صفحه']);
    // The branch is a submenu, not a flat entry — its own children stay one level further in.
    expect(opened[0].classList).toContain('ant-dropdown-menu-submenu');
    expect(opened[1].classList).toContain('ant-dropdown-menu-item');

    flush();
  }));

  it('should open a nested dropdown for a child that has children of its own', fakeAsync(() => {
    boot();

    hover(barItems()[1]);
    hover(document.querySelector('.ant-dropdown-menu-submenu-title')!);
    const nested = levelItems(true);

    expect(texts(nested)).toEqual(['دسترسی غیرمجاز', 'صفحه یافت نشد']);

    // `routerLink` on an `li` renders no `href`, so the link is checked by following it.
    nested[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    tick();

    expect(TestBed.inject(Router).url).toBe('/exception/403');

    flush();
  }));
});
