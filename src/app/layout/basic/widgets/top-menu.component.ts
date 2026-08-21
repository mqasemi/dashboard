import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavMenuService, NavNode, isNodeActive } from '@core';
import { LayoutDefaultModule } from '@delon/theme/layout-default';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';

import { HeaderTopMenuNodesComponent } from './top-menu-nodes.component';

/**
 * Horizontal menu for the "top navigation" layout mode.
 *
 * Built from `layout-default-top-menu-item` rather than `nz-menu nzMode="horizontal"` on purpose:
 * the alain header background is `@primary-color`, and the top-menu-item styles already inherit
 * the header's white-on-blue treatment. An `nz-menu` would arrive with Ant's own light surface
 * and would have to be re-themed to look like it belongs.
 *
 * That component is flat, so this template only owns the bar itself: one entry per top-level node,
 * with a dropdown hung off the ones that have children. Everything below that first level is
 * `header-top-menu-nodes`, which recurses to whatever depth the menu declares.
 */
@Component({
  selector: 'header-top-menu',
  template: `
    @for (item of items(); track item.text) {
      @if (item.children.length > 0) {
        <layout-default-top-menu-item
          nz-dropdown
          nzTrigger="hover"
          nzPlacement="bottomRight"
          [nzDropdownMenu]="subMenu"
          [selected]="isActive(item)"
          [disabled]="item.disabled"
        >
          @if (item.icon; as icon) {
            <nz-icon [nzType]="icon.type" [nzTheme]="icon.theme" class="mr-sm" />
          }
          {{ item.text }}
          <nz-icon nzType="down" class="ml-sm top-menu__arrow" />
        </layout-default-top-menu-item>
        <nz-dropdown-menu #subMenu="nzDropdownMenu">
          <ul nz-menu>
            <header-top-menu-nodes [nodes]="item.children" />
          </ul>
        </nz-dropdown-menu>
      } @else {
        <layout-default-top-menu-item [routerLink]="item.link" [selected]="isActive(item)" [disabled]="item.disabled">
          @if (item.icon; as icon) {
            <nz-icon [nzType]="icon.type" [nzTheme]="icon.theme" class="mr-sm" />
          }
          {{ item.text }}
        </layout-default-top-menu-item>
      }
    }
  `,
  host: {
    '[class.alain-default__top-menu]': 'true'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LayoutDefaultModule, NzDropDownModule, NzMenuModule, NzIconModule, HeaderTopMenuNodesComponent]
})
export class HeaderTopMenuComponent {
  private readonly nav = inject(NavMenuService);

  readonly items = computed(() => this.nav.items());

  isActive(node: NavNode): boolean {
    return isNodeActive(node, this.nav.url());
  }
}
