import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LayoutModeService, NavMenuService } from '@core';
import { DA_SERVICE_TOKEN } from '@delon/auth';
import { SettingsService } from '@delon/theme';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';

/**
 * Entry page for the `portal` layout mode: the app's sections as square, Windows-8-style tiles.
 *
 * Rendered under `LayoutBlankComponent`, so it has no sidebar and no header — the grid *is* the
 * navigation. Tiles come from `MenuService`, which means a feature added to the menu in Step 6
 * shows up here with no change to this component.
 *
 * Picking a tile lands on an ordinary route inside `LayoutBasicComponent`, which keeps its
 * sidebar, so the portal is a starting point rather than a mode the user is stuck inside. The one
 * thing that shell cannot offer from here is a way back out of portal mode before navigating, so a
 * discreet footer carries the sign-out and layout links; without it, switching back to the sidebar
 * layout would mean guessing a URL.
 */
@Component({
  selector: 'app-portal',
  templateUrl: './portal.component.html',
  styleUrl: './portal.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NzGridModule, NzIconModule]
})
export class PortalComponent {
  private readonly nav = inject(NavMenuService);
  private readonly settings = inject(SettingsService);
  private readonly layoutMode = inject(LayoutModeService);
  private readonly router = inject(Router);
  private readonly tokenService = inject(DA_SERVICE_TOKEN);

  /** Tile icon for a menu entry that did not declare one, so no tile renders as a bare label. */
  readonly fallbackIcon = 'appstore';

  readonly groups = computed(() => this.nav.groups());
  readonly appName = computed(() => this.settings.app.name ?? '');
  readonly userName = computed(() => this.settings.user.name ?? '');

  /** Leaves portal mode and continues to the ordinary sidebar shell. */
  useSidebarLayout(): void {
    this.layoutMode.setMode('sidebar');
    void this.router.navigateByUrl(this.layoutMode.startPage());
  }

  logout(): void {
    this.tokenService.clear();
    void this.router.navigateByUrl(this.tokenService.login_url!);
  }
}
