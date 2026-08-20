import { Injectable, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { MenuService } from '@delon/theme';
import { filter, map } from 'rxjs';

import { NavGroup, NavNode, toNavGroups, toNavItems } from './menu-tree';

/**
 * Signal view over `MenuService` for the shells that do not use `layout-default-nav`.
 *
 * The sidebar gets its menu from `@delon`'s own `layout-default-nav`, which keeps selection
 * state internally. The top menu and the portal grid have no such component, so they need the
 * menu and the current URL as signals — that is all this service is.
 */
@Injectable({ providedIn: 'root' })
export class NavMenuService {
  private readonly menuSrv = inject(MenuService);
  private readonly router = inject(Router);

  /** `MenuService.change` is backed by a `BehaviorSubject`, so this emits the current menu at once. */
  private readonly menus = toSignal(this.menuSrv.change, { initialValue: this.menuSrv.menus });

  /** Current URL, after redirects. */
  readonly url = toSignal(
    this.router.events.pipe(
      filter((ev): ev is NavigationEnd => ev instanceof NavigationEnd),
      map(ev => ev.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  /** Group headings with their entries — what the portal grid renders. */
  readonly groups = computed<NavGroup[]>(() => toNavGroups(this.menus()));

  /** Entries with the group level flattened away — what the header menu renders. */
  readonly items = computed<NavNode[]>(() => toNavItems(this.menus()));
}
