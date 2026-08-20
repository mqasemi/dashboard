import { TestBed } from '@angular/core/testing';
import { Menu, MenuService } from '@delon/theme';

import { NavNode, isNodeActive, toNavGroups, toNavItems } from './menu-tree';

/**
 * The menu is fed through a real `MenuService` rather than hand-built object literals, because the
 * whole point of `menu-tree.ts` is to consume what `fixItem()` produces — the `_hidden`, `group`,
 * `disabled` and normalised-`icon` fields a literal would have to fake (and would fake wrongly the
 * moment @delon changes them).
 */
function buildMenu(data: Menu[]): Menu[] {
  const srv = TestBed.inject(MenuService);
  srv.add(data);
  return srv.menus;
}

describe('menu-tree', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  describe('toNavGroups', () => {
    it('should map a group heading onto its children', () => {
      const groups = toNavGroups(buildMenu([{ text: 'منوی اصلی', group: true, children: [{ text: 'داشبورد', link: '/dashboard' }] }]));

      expect(groups.length).toBe(1);
      expect(groups[0].text).toBe('منوی اصلی');
      expect(groups[0].items.map(i => i.link)).toEqual(['/dashboard']);
    });

    it('should normalise a string icon into an nz-icon type and theme', () => {
      const groups = toNavGroups(
        buildMenu([{ text: 'g', group: true, children: [{ text: 'داشبورد', link: '/dashboard', icon: 'anticon-dashboard' }] }])
      );

      expect(groups[0].items[0].icon).toEqual({ type: 'dashboard', theme: 'outline' });
    });

    it('should drop icons that are not nz-icons, rather than pass a class name to nzType', () => {
      const groups = toNavGroups(buildMenu([{ text: 'g', group: true, children: [{ text: 'x', link: '/x', icon: 'fa fa-user' }] }]));

      expect(groups[0].items[0].icon).toBeNull();
    });

    it('should keep nested children so the top menu can render a dropdown', () => {
      const groups = toNavGroups(
        buildMenu([
          {
            text: 'ابزارها',
            group: true,
            children: [{ text: 'صفحات خطا', children: [{ text: '404', link: '/exception/404' }] }]
          }
        ])
      );

      expect(groups[0].items[0].link).toBe('');
      expect(groups[0].items[0].children.map(c => c.link)).toEqual(['/exception/404']);
    });

    it('should omit hidden entries at every level', () => {
      const groups = toNavGroups(
        buildMenu([
          {
            text: 'g',
            group: true,
            children: [
              { text: 'دیده می‌شود', link: '/a' },
              { text: 'پنهان', link: '/b', hide: true }
            ]
          },
          { text: 'گروه پنهان', group: true, hide: true, children: [{ text: 'c', link: '/c' }] }
        ])
      );

      expect(groups.length).toBe(1);
      expect(groups[0].items.map(i => i.link)).toEqual(['/a']);
    });

    it('should keep a top-level entry that is not a group under a heading-less group', () => {
      // Nothing should silently vanish from the portal just because the menu skipped the wrapper.
      const groups = toNavGroups(buildMenu([{ text: 'تنها', link: '/solo', group: false }]));

      expect(groups.length).toBe(1);
      expect(groups[0].text).toBe('');
      expect(groups[0].items.map(i => i.link)).toEqual(['/solo']);
    });
  });

  describe('toNavItems', () => {
    it('should flatten the group level away', () => {
      const items = toNavItems(
        buildMenu([
          { text: 'الف', group: true, children: [{ text: 'a', link: '/a' }] },
          { text: 'ب', group: true, children: [{ text: 'b', link: '/b' }] }
        ])
      );

      expect(items.map(i => i.link)).toEqual(['/a', '/b']);
    });
  });

  describe('isNodeActive', () => {
    let node: NavNode;

    beforeEach(() => {
      node = toNavItems(
        buildMenu([
          {
            text: 'g',
            group: true,
            children: [{ text: 'کاربران', link: '/users', children: [{ text: 'نقش‌ها', link: '/roles' }] }]
          }
        ])
      )[0];
    });

    it('should match the exact url', () => {
      expect(isNodeActive(node, '/users')).toBeTrue();
    });

    it('should match a child route', () => {
      expect(isNodeActive(node, '/users/12/edit')).toBeTrue();
    });

    it('should ignore the query string and fragment', () => {
      expect(isNodeActive(node, '/users?page=2')).toBeTrue();
      expect(isNodeActive(node, '/users#top')).toBeTrue();
    });

    it('should not match a sibling that merely shares a prefix', () => {
      expect(isNodeActive(node, '/users-archive')).toBeFalse();
    });

    it('should stay active while one of its children is open', () => {
      expect(isNodeActive(node, '/roles')).toBeTrue();
    });

    it('should not treat an empty link as matching everything', () => {
      const parent = toNavItems(
        buildMenu([{ text: 'g', group: true, children: [{ text: 'بدون مسیر', children: [{ text: 'x', link: '/x' }] }] }])
      )[0];

      expect(parent.link).toBe('');
      expect(isNodeActive(parent, '/other')).toBeFalse();
      expect(isNodeActive(parent, '/x')).toBeTrue();
    });
  });
});
