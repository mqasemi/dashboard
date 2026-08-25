import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Router, provideRouter } from '@angular/router';
import { Menu, MenuService } from '@delon/theme';
import { provideNzIcons } from 'ng-zorro-antd/icon';

import { HeaderTopMenuComponent } from './top-menu.component';
import { ICONS } from '../../../../style-icons';
import { ICONS_AUTO } from '../../../../style-icons-auto';

/**
 * The menu the app ships plus one synthetic extra level: the real data already reaches
 * Parent > Child > Grandchild, and the fourth tier proves the recursion has no fixed depth.
 */
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
          {
            text: 'دسترسی غیرمجاز',
            link: '/exception/403',
            children: [{ text: 'جزئیات خطا', link: '/exception/500' }]
          },
          { text: 'صفحه یافت نشد', link: '/exception/404' }
        ]
      },
      { text: 'قفل صفحه', link: '/passport/lock', icon: 'anticon-lock', disabled: true }
    ]
  }
];

/**
 * `menu-tree.spec.ts` proves the tree keeps its shape; this proves the template renders that
 * shape with ng-zorro's own behaviour intact — which is exactly what a naive shared-template
 * recursion breaks (NG0201 / dead hover chains). Dropdown levels live in CDK overlays attached
 * to `document.body`, so assertions query there rather than through the fixture.
 */
describe('HeaderTopMenuComponent', () => {
  let fixture: ComponentFixture<HeaderTopMenuComponent>;
  let host: HTMLElement;

  beforeEach(() => {
    document.documentElement.setAttribute('dir', 'ltr');
    TestBed.configureTestingModule({
      providers: [
        // Routes without components: enough for `routerLink` to resolve and for the URL to change.
        provideRouter([
          { path: 'dashboard', children: [] },
          { path: 'exception/403', children: [] },
          { path: 'exception/500', children: [] },
          { path: 'passport/lock', children: [] }
        ]),
        provideNoopAnimations(),
        provideNzIcons([...ICONS, ...ICONS_AUTO])
      ]
    });
    TestBed.inject(MenuService).add(APP_MENU);
  });

  afterEach(() => {
    document.documentElement.setAttribute('dir', 'ltr');
  });

  /**
   * `nz-submenu` debounces its open state behind `auditTime(150)`, so the fixture lives inside
   * the fake-async zone and every hover is followed by a `tick()` past that window.
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

  /**
   * Entries of one popup level: the recursive renderer's host IS each `<ul>`, so items sit
   * directly inside it. Deeper levels live in their own overlays, never under this one, so
   * the query cannot leak across generations.
   */
  function levelItems(level: HTMLElement): HTMLElement[] {
    return Array.from(level.querySelectorAll<HTMLElement>(':scope > ul > li'));
  }

  /** Every open popup overlay host, in the order they were attached. */
  function popups(): HTMLElement[] {
    return Array.from(document.querySelectorAll<HTMLElement>('.cdk-overlay-container .ant-menu-submenu-popup'));
  }

  it('should put both top-level entries on a horizontal bar as direct list children', () => {
    boot();

    const bar = host.querySelector<HTMLElement>('ul.ant-menu-horizontal')!;
    expect(bar).toBeTruthy();
    // Strict parent-child DOM: Ant's `.ant-menu-horizontal > .ant-menu-submenu` rules depend on it.
    expect(bar.querySelectorAll(':scope > li').length).toBe(2);
    expect(bar.querySelectorAll(':scope > li.ant-menu-submenu, :scope > li.ant-menu-item').length).toBe(2);
    expect(texts(Array.from(bar.querySelectorAll<HTMLElement>(':scope > li')))).toEqual(['داشبورد', 'ابزارها']);
  });

  it('should lay the root entries out side-by-side on one row', () => {
    boot();

    // Real layout, not just DOM shape: Ant lines entries up via `display:inline-block` on
    // `.ant-menu-horizontal > …`, and any override of those display rules stacks them.
    const [first, second] = Array.from(host.querySelectorAll<HTMLElement>('ul.top-bar > li')).map(li => li.getBoundingClientRect());

    expect(first.width).toBeGreaterThan(0);
    expect(second.width).toBeGreaterThan(0);
    expect(Math.abs(first.top - second.top)).toBeLessThan(2);
    expect(second.left).toBeGreaterThanOrEqual(first.right - 1);
  });

  it('should keep the branch and its sibling leaf together in the parent dropdown', fakeAsync(() => {
    boot();

    hover(host.querySelector('li.ant-menu-submenu > .ant-menu-submenu-title')!);

    const firstPopup = document.querySelector<HTMLElement>('.cdk-overlay-container .ant-menu-sub')!;
    const entries = levelItems(firstPopup);

    expect(texts(entries)).toEqual(['صفحات خطا', 'قفل صفحه']);
    // The branch stays a submenu rather than being flattened onto this level.
    expect(entries[0].classList).toContain('ant-menu-submenu');
    expect(entries[1].classList).toContain('ant-menu-item');

    flush();
  }));

  /** Opens the "ابزارها" branch and returns the sub container of each opened popup, outermost first. */
  function openToDepth(levels: number): HTMLElement[] {
    hover(host.querySelector('li.ant-menu-submenu > .ant-menu-submenu-title')!);
    const subs: HTMLElement[] = [document.querySelector<HTMLElement>('.cdk-overlay-container .ant-menu-sub')!];
    while (subs.length < levels) {
      const nextTitle = subs[subs.length - 1].querySelector<HTMLElement>('.ant-menu-submenu-title')!;
      hover(nextTitle);
      subs.push(
        popups()
          .map(p => p.querySelector<HTMLElement>('.ant-menu-sub'))
          .find(sub => !!sub && !subs.includes(sub))!
      );
    }
    return subs;
  }

  it('should nest grandchild dropdowns below the child dropdown without losing any', fakeAsync(() => {
    boot();

    const subs = openToDepth(3);

    // All three generations are open at once — the hover chain survived every boundary.
    expect(document.querySelectorAll('.ant-menu-submenu-open').length).toBeGreaterThanOrEqual(3);

    // Generation 2 holds the branch and its sibling leaf; generation 3 the branch's own child.
    expect(texts(levelItems(subs[1]))).toEqual(['دسترسی غیرمجاز', 'صفحه یافت نشد']);
    expect(texts(levelItems(subs[2]))).toEqual(['جزئیات خطا']);
    // The middle generation keeps exactly one branch of its own.
    expect(subs[1].querySelectorAll('ul li.ant-menu-submenu').length).toBe(1);

    flush();
  }));

  it('should hide the caret on root submenus but keep it on nested fly-outs', fakeAsync(() => {
    boot();

    // Level 1: the arrow span is rendered but suppressed by the bar-scoped rule.
    const barArrow = host.querySelector<HTMLElement>('ul.top-bar > li.ant-menu-submenu .ant-menu-submenu-arrow')!;
    expect(barArrow).toBeTruthy();
    expect(getComputedStyle(barArrow).display).toBe('none');

    // Level 2 lives in a body-level overlay outside the host, so its arrow stays visible.
    openToDepth(2);
    const nestedArrow = document.querySelector<HTMLElement>('.cdk-overlay-container li.ant-menu-submenu .ant-menu-submenu-arrow')!;
    expect(nestedArrow).toBeTruthy();
    expect(getComputedStyle(nestedArrow).display).not.toBe('none');

    flush();
  }));

  it('should render deeper levels as vertical flyouts, not more dropdowns from the bar', fakeAsync(() => {
    boot();

    openToDepth(2);

    // The last-attached popup is the deepest one.
    const nested = popups()[popups().length - 1];
    // Vertical inheritance shows up as a side placement; a bottom placement would mean the
    // nested submenu fell back to root (horizontal) mode.
    const placement = ['ant-menu-submenu-placement-right', 'ant-menu-submenu-placement-left'].find(c => nested.classList.contains(c));
    expect(placement).toBeTruthy();
    expect(nested.classList).not.toContain('ant-menu-submenu-placement-bottom');

    flush();
  }));

  it('should mark the direction of popups for rtl', fakeAsync(() => {
    document.documentElement.setAttribute('dir', 'rtl');

    boot();
    openToDepth(2);

    const directed = popups().filter(p => p.classList.contains('ant-menu-submenu-rtl'));
    expect(directed.length).toBe(popups().length);
    expect(directed.length).toBeGreaterThan(0);

    flush();
  }));

  it('should navigate when an entry three levels down is clicked', fakeAsync(() => {
    boot();

    const subs = openToDepth(3);
    const leaf = levelItems(subs[2]).find(li => li.textContent?.includes('جزئیات خطا'))!;

    leaf.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    tick();

    expect(TestBed.inject(Router).url).toBe('/exception/500');

    flush();
  }));

  it('should carry the disabled state into the dropdown entry', fakeAsync(() => {
    boot();
    hover(host.querySelector('li.ant-menu-submenu > .ant-menu-submenu-title')!);

    const items = Array.from(document.querySelectorAll<HTMLElement>('.cdk-overlay-container li.ant-menu-item'));
    const lock = items.find(t => t.textContent?.includes('قفل صفحه'));

    expect(lock).toBeDefined();
    expect(lock!.classList).toContain('ant-menu-item-disabled');

    flush();
  }));
});
