import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { LayoutModeService } from '@core';
import { SettingsService, User } from '@delon/theme';
import { LayoutDefaultModule, LayoutDefaultOptions } from '@delon/theme/layout-default';
import { SettingDrawerModule } from '@delon/theme/setting-drawer';
import { ThemeBtnComponent } from '@delon/theme/theme-btn';
import { environment } from '@env/environment';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { HeaderClearStorageComponent } from './widgets/clear-storage.component';
import { HeaderFullScreenComponent } from './widgets/fullscreen.component';
import { HeaderLayoutModeComponent } from './widgets/layout-mode.component';
import { HeaderPersianDigitsComponent } from './widgets/persian-digits.component';
import { HeaderRTLComponent } from './widgets/rtl.component';
import { HeaderSearchComponent } from './widgets/search.component';
import { HeaderTopMenuComponent } from './widgets/top-menu.component';
import { HeaderUserComponent } from './widgets/user.component';

/**
 * The shell for every routed feature page, in both the `sidebar` and `top` layout modes.
 *
 * ## Sidebar mode
 * The aside lands on the **right** without any positioning code here: `@delon`'s
 * `.alain-default__aside` is `position: absolute` with neither `left` nor `right` set, so its
 * static position follows the inline-start edge — which RTL puts on the right — and
 * `_layout.less`'s own `[dir='rtl']` mixin swaps the content margin to match. `provideDirection()`
 * is what guarantees `dir="rtl"` is applied before this renders.
 *
 * ## Top mode
 * `hideAside` removes the aside and `header-top-menu` fills the header. Below `768px` a horizontal
 * bar has nowhere to put a menu, so the entries move into an `nz-drawer` behind a hamburger; the
 * drawer reuses `layout-default-nav` so both modes share one menu renderer.
 *
 * `portal` mode is not handled here — the tile grid is a route under `LayoutBlankComponent`, and
 * feature pages opened from a tile use this component in its `sidebar` form.
 *
 * Left on the default change-detection strategy deliberately. `layout-default` and its children
 * are `Default`-strategy components that mutate their own state from router events without
 * calling `markForCheck()` (`LayoutDefaultComponent.processEv` drives the progress bar this way);
 * an `OnPush` ancestor would skip the whole subtree and freeze them.
 */
@Component({
  selector: 'layout-basic',
  template: `
    <layout-default [options]="options()" [asideUser]="asideUserTpl" [content]="contentTpl" [customError]="null">
      <layout-default-header-item direction="left" hidden="mobile">
        @if (isTopMenu()) {
          <header-top-menu />
        } @else {
          <a layout-default-header-item-trigger routerLink="/passport/lock" nz-tooltip nzTooltipTitle="قفل صفحه">
            <nz-icon nzType="lock" />
          </a>
        }
      </layout-default-header-item>
      <layout-default-header-item direction="left" hidden="pc">
        @if (isTopMenu()) {
          <div layout-default-header-item-trigger (click)="navDrawer.set(true)" nz-tooltip nzTooltipTitle="منو">
            <nz-icon nzType="bars" />
          </div>
        }
        <div layout-default-header-item-trigger (click)="searchToggleStatus = !searchToggleStatus">
          <nz-icon nzType="search" />
        </div>
      </layout-default-header-item>
      <layout-default-header-item direction="middle">
        <header-search class="alain-default__search" [toggleChange]="searchToggleStatus" />
      </layout-default-header-item>
      <layout-default-header-item direction="right" hidden="mobile">
        <div
          layout-default-header-item-trigger
          nz-dropdown
          [nzDropdownMenu]="settingsMenu"
          nzTrigger="click"
          nzPlacement="bottomRight"
          nz-tooltip
          nzTooltipTitle="تنظیمات"
        >
          <nz-icon nzType="setting" />
        </div>
        <nz-dropdown-menu #settingsMenu="nzDropdownMenu">
          <div nz-menu style="width: 220px;">
            <header-layout-mode />
            <li nz-menu-divider></li>
            <div nz-menu-item>
              <header-persian-digits />
            </div>
            <div nz-menu-item>
              <header-rtl />
            </div>
            <div nz-menu-item>
              <header-fullscreen />
            </div>
            <div nz-menu-item>
              <header-clear-storage />
            </div>
          </div>
        </nz-dropdown-menu>
      </layout-default-header-item>
      <layout-default-header-item direction="right">
        <header-user />
      </layout-default-header-item>
      <ng-template #asideUserTpl>
        <div nz-dropdown nzTrigger="click" [nzDropdownMenu]="userMenu" class="alain-default__aside-user">
          <nz-avatar class="alain-default__aside-user-avatar" [nzSrc]="user.avatar" />
          <div class="alain-default__aside-user-info">
            <strong>{{ user.name }}</strong>
            <p class="mb0 ltr-text">{{ user.email }}</p>
          </div>
        </div>
        <nz-dropdown-menu #userMenu="nzDropdownMenu">
          <ul nz-menu>
            <li nz-menu-item [routerLink]="layoutMode.startPage()">خانه</li>
          </ul>
        </nz-dropdown-menu>
      </ng-template>
      <ng-template #contentTpl>
        <router-outlet />
      </ng-template>
    </layout-default>
    @if (isTopMenu()) {
      <nz-drawer
        nzPlacement="right"
        nzTitle="منو"
        [nzWidth]="260"
        [nzBodyStyle]="{ padding: '0' }"
        [nzVisible]="navDrawer()"
        (nzOnClose)="navDrawer.set(false)"
      >
        <ng-container *nzDrawerContent>
          <layout-default-nav [autoCloseUnderPad]="false" (select)="navDrawer.set(false)" />
        </ng-container>
      </nz-drawer>
    }
    @if (showSettingDrawer) {
      <setting-drawer />
    }
    <theme-btn />
  `,
  imports: [
    RouterOutlet,
    RouterLink,
    LayoutDefaultModule,
    SettingDrawerModule,
    ThemeBtnComponent,
    NzIconModule,
    NzMenuModule,
    NzDropDownModule,
    NzAvatarModule,
    NzToolTipModule,
    NzDrawerModule,
    HeaderSearchComponent,
    HeaderClearStorageComponent,
    HeaderFullScreenComponent,
    HeaderLayoutModeComponent,
    HeaderPersianDigitsComponent,
    HeaderRTLComponent,
    HeaderTopMenuComponent,
    HeaderUserComponent
  ]
})
export class LayoutBasicComponent {
  private readonly settings = inject(SettingsService);
  readonly layoutMode = inject(LayoutModeService);

  readonly isTopMenu = this.layoutMode.isTopMenu;

  readonly options = computed<LayoutDefaultOptions>(() => ({
    logoExpanded: `./assets/logo-full.svg`,
    logoCollapsed: `./assets/logo.svg`,
    logoLink: this.layoutMode.startPage(),
    hideAside: this.isTopMenu()
  }));

  /** Mobile menu drawer; only reachable in top mode. */
  readonly navDrawer = signal(false);

  searchToggleStatus = false;
  showSettingDrawer = !environment.production;

  get user(): User {
    return this.settings.user;
  }
}
