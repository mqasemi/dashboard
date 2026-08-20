import type { Menu, MenuInner } from '@delon/theme';

/** An `nz-icon` reduced to the two inputs the shells bind. */
export interface NavIcon {
  /** `nz-icon`'s `nzType`; must be registered in `src/style-icons.ts`. */
  readonly type: string;
  readonly theme: 'outline' | 'twotone' | 'fill';
}

/**
 * A menu entry reduced to exactly what the layout shells render.
 *
 * `MenuService` hands out `Menu` objects carrying an `[key: string]: any` index signature and a
 * dozen fields only `layout-default-nav` cares about (`badge*`, `reuse`, `shortcut`, `_id`…).
 * Narrowing to this type at the boundary is what keeps `any` out of the top menu and the portal,
 * per CLAUDE.md's strict-typing rule. It also collapses `MenuIcon.value`'s `string | SafeHtml`
 * union down to the `string` that `nzType` accepts under `strictTemplates`.
 */
export interface NavNode {
  readonly text: string;
  /** Internal route, or `''` when the entry is a pure parent or points outward. */
  readonly link: string;
  /** External URL, or `''`. */
  readonly externalLink: string;
  readonly target: '_blank' | '_self' | '_parent' | '_top' | null;
  /** `null` unless the menu supplied an `nz-icon`; `class`/`img`/`svg` icons are not rendered. */
  readonly icon: NavIcon | null;
  readonly disabled: boolean;
  readonly children: readonly NavNode[];
}

/** A top-level `group: true` menu node and the entries under it. */
export interface NavGroup {
  readonly text: string;
  readonly items: readonly NavNode[];
}

/** `MenuService` marks ACL-denied and `hide: true` entries rather than dropping them. */
function isVisible(item: MenuInner): boolean {
  return item._hidden !== true && item._aclResult !== false;
}

/**
 * `MenuService.fixItem()` has already normalised a string icon into a `MenuIcon` and defaulted
 * `theme`, so the only work left is rejecting the non-`nz-icon` variants and the `SafeHtml`
 * flavour of `value` that `svg` icons use.
 */
function toIcon(icon: Menu['icon']): NavIcon | null {
  if (icon == null || typeof icon !== 'object' || icon.type !== 'icon' || typeof icon.value !== 'string') {
    return null;
  }
  return { type: icon.value, theme: icon.theme ?? 'outline' };
}

function toNode(item: Menu): NavNode {
  const inner = item as MenuInner;
  return {
    text: inner.text ?? '',
    link: inner.link ?? '',
    externalLink: inner.externalLink ?? '',
    target: inner.target ?? null,
    icon: toIcon(inner.icon),
    disabled: inner.disabled === true,
    children: (inner.children ?? []).filter(isVisible).map(toNode)
  };
}

/**
 * Splits the menu into its group headings — the shape the portal grid renders.
 *
 * `MenuService` defaults `group` to `true`, so a hand-written menu without an explicit wrapper
 * still arrives as groups. A non-group top-level node is kept as a lone entry under a
 * heading-less group rather than dropped, so nothing silently disappears from the portal.
 */
export function toNavGroups(menus: readonly Menu[]): NavGroup[] {
  const groups: NavGroup[] = [];
  for (const menu of menus.filter(isVisible)) {
    const node = toNode(menu);
    if (node.children.length > 0) {
      groups.push({ text: node.text, items: node.children });
    } else if ((menu as MenuInner).group !== true) {
      groups.push({ text: '', items: [node] });
    }
  }
  return groups;
}

/** Flattens the group level away — the shape a horizontal header menu renders. */
export function toNavItems(menus: readonly Menu[]): NavNode[] {
  return toNavGroups(menus).flatMap(group => group.items);
}

/**
 * Whether `url` is inside `node`'s subtree, used to light up the selected top-menu entry.
 *
 * Prefix-matched on a segment boundary so `/users` does not claim `/users-archive`, and
 * recursive so a parent stays highlighted while one of its children is open.
 */
export function isNodeActive(node: NavNode, url: string): boolean {
  const path = url.split(/[?#]/)[0];
  if (node.link !== '' && (path === node.link || path.startsWith(`${node.link}/`))) {
    return true;
  }
  return node.children.some(child => isNodeActive(child, url));
}
