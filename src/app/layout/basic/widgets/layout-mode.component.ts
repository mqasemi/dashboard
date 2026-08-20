import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LAYOUT_MODES, LAYOUT_MODE_META, LayoutMode, LayoutModeService, PORTAL_URL } from '@core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';

/**
 * Header entry that switches between the three layout shells.
 *
 * Leaving `portal` mode has to move the user off `/portal`, because that route renders the blank
 * layout and would otherwise keep showing tiles after the mode says "sidebar". Entering it
 * navigates *to* the portal so the change is visible immediately instead of only on the next
 * cold start. `LayoutModeService` persists the choice.
 */
@Component({
  selector: 'header-layout-mode',
  template: `
    <div nz-menu-group [nzTitle]="'حالت چیدمان'">
      @for (mode of modes; track mode) {
        <div nz-menu-item [nzSelected]="layout.mode() === mode" (click)="select(mode)">
          <nz-icon [nzType]="meta[mode].icon" class="mr-sm" />
          {{ meta[mode].label }}
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NzIconModule, NzMenuModule]
})
export class HeaderLayoutModeComponent {
  readonly layout = inject(LayoutModeService);
  private readonly router = inject(Router);

  readonly modes = LAYOUT_MODES;
  readonly meta = LAYOUT_MODE_META;

  select(mode: LayoutMode): void {
    if (mode === this.layout.mode()) {
      return;
    }
    const leavingPortal = this.layout.mode() === 'portal' && this.router.url.startsWith(PORTAL_URL);
    this.layout.setMode(mode);
    if (mode === 'portal') {
      void this.router.navigateByUrl(PORTAL_URL);
    } else if (leavingPortal) {
      void this.router.navigateByUrl(this.layout.startPage());
    }
  }
}
