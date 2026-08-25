import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavMenuService, NavNode, isNodeActive } from '@core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';

/**
 * Renders one nested list of menu nodes — the host IS the `<ul>`, its template emits only
 * `<li>` elements. That keeps the DOM at the strict parent-child relationship Ant's
 * stylesheet expects inside popups (`div.ant-menu-sub > ul > li`,
 * `.ant-menu-vertical > .ant-menu-item`, …); any wrapper element between a `ul` and its
 * `li`s silently kills those direct-child rules and collapses the layout.
 *
 * Every branch list carries its own `nz-menu nzMode="vertical"`: it is a self-contained
 * vertical menu hanging under its parent submenu, so fly-out mode and Ant's vertical styles
 * are native, and its services resolve locally instead of depending on injector climbing.
 *
 * Recursion goes through nested component instances rather than one shared `ng-template`
 * re-entered via `ngTemplateOutlet`: Angular resolves element injectors at the template's
 * declaration site, so a shared template severs ng-zorro's parent `NzSubmenuService`
 * discovery (fails NG0201) and levels below the first lose their hover chain.
 *
 * Selection is bound by hand because content queries do not reach across the component
 * boundary; everything else — arrows, popup placement, RTL direction — is native.
 */
@Component({
  selector: 'ul[headerNav]',
  template: `
    @for (node of nodes(); track node.text) {
      @if (node.children.length > 0) {
        <li nz-submenu [nzDisabled]="node.disabled" [class.ant-menu-submenu-selected]="isActive(node)">
          <div title>
            @if (node.icon; as icon) {
              <nz-icon [nzType]="icon.type" [nzTheme]="icon.theme" />
            }
            {{ node.text }}
          </div>
          <ul headerNav nz-menu nzMode="vertical" [nodes]="node.children"></ul>
        </li>
      } @else {
        <li nz-menu-item [nzSelected]="isActive(node)" [nzDisabled]="node.disabled" [routerLink]="node.link">
          @if (node.icon; as icon) {
            <nz-icon [nzType]="icon.type" [nzTheme]="icon.theme" />
          }
          {{ node.text }}
        </li>
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NzIconModule, NzMenuModule]
})
export class HeaderNavListComponent {
  private readonly nav = inject(NavMenuService);

  readonly nodes = input.required<readonly NavNode[]>();

  /** A parent counts as active while any of its descendants is the open route. */
  isActive(node: NavNode): boolean {
    return isNodeActive(node, this.nav.url());
  }
}

/**
 * Horizontal menu for the "top navigation" layout mode.
 *
 * `<ul nz-menu nzMode="horizontal">` fed by the same nested tree the sidebar uses —
 * `NavMenuService.items()` arrives with its nesting intact and nothing here reshapes it.
 * Root entries sit directly on the bar (level 1 therefore opens downward); each of them
 * that has children hosts a recursive vertical list in its popup, which flies out sideways
 * at every deeper level. Arrows and popup sides follow the document direction that
 * `provideDirection()` establishes — no RTL code anywhere.
 *
 * The root level is written out rather than delegated to the recursive list because the
 * bar's `nz-menu` context and these items must share one view; the duplication is two
 * small branches, and the data stays single-sourced in `core/menu-tree.ts`. The only CSS
 * themes the bar onto the alain header (white-on-primary, full-height targets) using the
 * library's own tokens; popup lists keep Ant's stock light look untouched.
 */
@Component({
  selector: 'header-top-menu',
  template: `
    <ul nz-menu nzMode="horizontal" class="top-bar">
      @for (item of items(); track item.text) {
        @if (item.children.length > 0) {
          <li nz-submenu [nzDisabled]="item.disabled" [class.ant-menu-submenu-selected]="isActive(item)">
            <div title>
              @if (item.icon; as icon) {
                <nz-icon [nzType]="icon.type" [nzTheme]="icon.theme" />
              }
              {{ item.text }}
            </div>
            <ul headerNav nz-menu nzMode="vertical" [nodes]="item.children"></ul>
          </li>
        } @else {
          <li nz-menu-item [nzSelected]="isActive(item)" [nzDisabled]="item.disabled" [routerLink]="item.link">
            @if (item.icon; as icon) {
              <nz-icon [nzType]="icon.type" [nzTheme]="icon.theme" />
            }
            {{ item.text }}
          </li>
        }
      }
    </ul>
  `,
  host: {
    '[class.alain-default__top-menu]': 'true'
  },
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        height: var(--alain-default-header-hg, 64px);
      }

      /* Theme-only overrides for the bar instance (ul.top-bar): every rule anchors under
         this host, and flyout lists attach to document.body so they can never match.
         Layout is left entirely to Ant - its own .ant-menu-horizontal > ... rule lines the
         entries up with display:inline-block, so nothing here may change display, position
         or padding. Only colours are bridged onto the primary-coloured header; the rgba
         values mirror @alain-default-header-nav-bg-hover, which component styles cannot
         see. */
      :host ::ng-deep ul.top-bar {
        background: transparent;
        border-bottom: none;
      }

      :host ::ng-deep ul.top-bar > li.ant-menu-item,
      :host ::ng-deep ul.top-bar > li.ant-menu-submenu {
        color: #fff;
      }

      /* Root entries carry their branch in the open dropdown, so the caret is noise up
         here; deeper levels keep theirs. The ul.top-bar > li child combinator confines
         this to level 1 - popup lists attach to document.body and never match. */
      :host ::ng-deep ul.top-bar > li.ant-menu-submenu > .ant-menu-submenu-title .ant-menu-submenu-arrow {
        display: none;
      }

      :host ::ng-deep ul.top-bar > li.ant-menu-item:hover,
      :host ::ng-deep ul.top-bar > li.ant-menu-item-active,
      :host ::ng-deep ul.top-bar > li.ant-menu-submenu:hover,
      :host ::ng-deep ul.top-bar > li.ant-menu-submenu-active,
      :host ::ng-deep ul.top-bar > li.ant-menu-submenu-open > .ant-menu-submenu-title {
        color: #fff;
        background-color: rgb(255 255 255 / 20%);
      }

      :host ::ng-deep ul.top-bar > li.ant-menu-item-selected,
      :host ::ng-deep ul.top-bar > li.ant-menu-submenu-selected {
        color: #fff;
      }

      /* The selected underline stays visible on the blue surface. */
      :host ::ng-deep ul.top-bar > li.ant-menu-item-selected::after,
      :host ::ng-deep ul.top-bar > li.ant-menu-submenu-selected::after {
        border-bottom-color: #fff;
      }

      :host ::ng-deep ul.top-bar > li.ant-menu-item-disabled,
      :host ::ng-deep ul.top-bar > li.ant-menu-submenu-disabled {
        color: rgb(255 255 255 / 50%);
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeaderNavListComponent, RouterLink, NzIconModule, NzMenuModule]
})
export class HeaderTopMenuComponent {
  private readonly nav = inject(NavMenuService);

  readonly items = computed(() => this.nav.items());

  isActive(node: NavNode): boolean {
    return isNodeActive(node, this.nav.url());
  }
}
