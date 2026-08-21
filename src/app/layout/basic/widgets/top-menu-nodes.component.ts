import { ChangeDetectionStrategy, Component, forwardRef, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavMenuService, NavNode, isNodeActive } from '@core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';

/**
 * One level of the top menu's dropdown, recursing into itself for every level below it.
 *
 * The recursion is deliberately a component rather than an `ng-template` re-entered through
 * `ngTemplateOutlet`: `NzSubmenuService` finds its parent with
 * `inject(NzSubmenuService, { skipSelf: true })`, which walks the *node injector* — i.e. where a
 * view is declared, not where it is inserted. A single shared template is declared once, so every
 * level would resolve to the same injector: nested submenus would not find their parent, and
 * moving the pointer into a third-level dropdown would close the second-level one under it.
 * Nesting the component nests the injectors, which is what keeps the hover chain alive.
 *
 * `nz-menu`'s own content queries do not reach into this view, which costs nothing here: inside a
 * dropdown `nzSelectable` is false, and the remaining query use is inline-collapse bookkeeping.
 * The one thing they would have given us is the parent's "a child is selected" class, so that is
 * bound directly below.
 */
@Component({
  selector: 'header-top-menu-nodes',
  template: `
    @for (node of nodes(); track node.text) {
      @if (node.children.length > 0) {
        <li
          nz-submenu
          [nzTitle]="node.text"
          [nzIcon]="node.icon?.type ?? null"
          [nzDisabled]="node.disabled"
          [class.ant-dropdown-menu-submenu-selected]="isActive(node)"
        >
          <header-top-menu-nodes [nodes]="node.children" />
        </li>
      } @else {
        <li nz-menu-item [nzSelected]="isActive(node)" [nzDisabled]="node.disabled" [routerLink]="node.link">
          @if (node.icon; as icon) {
            <nz-icon [nzType]="icon.type" [nzTheme]="icon.theme" class="mr-sm" />
          }
          {{ node.text }}
        </li>
      }
    }
  `,
  // The host element sits between the menu's `ul` and its `li`s, where a box would break the
  // list's flow; `contents` keeps the items laid out as if they were written inline.
  styles: [
    `
      :host {
        display: contents;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [forwardRef(() => HeaderTopMenuNodesComponent), RouterLink, NzMenuModule, NzIconModule]
})
export class HeaderTopMenuNodesComponent {
  private readonly nav = inject(NavMenuService);

  readonly nodes = input.required<readonly NavNode[]>();

  /** A parent counts as active while any of its descendants is the open route. */
  isActive(node: NavNode): boolean {
    return isNodeActive(node, this.nav.url());
  }
}
