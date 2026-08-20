import { HttpClient } from '@angular/common/http';
import { APP_INITIALIZER, Injectable, Provider, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ACLService } from '@delon/acl';
import { DA_SERVICE_TOKEN } from '@delon/auth';
import { MenuService, SettingsService, TitleService, type App, type User } from '@delon/theme';
import type { NzSafeAny } from 'ng-zorro-antd/core/types';
import { Observable, of, catchError, map } from 'rxjs';

/**
 * Used for application startup
 * Generally used to get the basic data of the application, like: Menu Data, User Data, etc.
 */
export function provideStartup(): Provider[] {
  return [
    StartupService,
    {
      provide: APP_INITIALIZER,
      useFactory: (startupService: StartupService) => () => startupService.load(),
      deps: [StartupService],
      multi: true
    }
  ];
}

@Injectable()
export class StartupService {
  private menuService = inject(MenuService);
  private settingService = inject(SettingsService);
  private tokenService = inject(DA_SERVICE_TOKEN);
  private aclService = inject(ACLService);
  private titleService = inject(TitleService);
  private httpClient = inject(HttpClient);
  private router = inject(Router);
  // If http request allows anonymous access, you need to add `ALLOW_ANONYMOUS`:
  // this.httpClient.get('/app', { context: new HttpContext().set(ALLOW_ANONYMOUS, true) })
  private appData$ = this.httpClient.get('./assets/tmp/app-data.json').pipe(
    catchError((res: NzSafeAny) => {
      console.warn(`StartupService.load: Network request failed`, res);
      setTimeout(() => this.router.navigateByUrl(`/exception/500`));
      return of({});
    })
  );

  private handleAppData(res: NzSafeAny): void {
    // Application information: including site name, description, year
    this.settingService.setApp(res.app);
    // User information: including name, avatar, email address
    this.settingService.setUser(res.user);
    // ACL: Set the permissions to full, https://ng-alain.com/acl/getting-started
    this.aclService.setFull(true);
    // Menu data, https://ng-alain.com/theme/menu
    this.menuService.add(res.menu ?? []);
    // Can be set page suffix title, https://ng-alain.com/theme/title
    this.titleService.suffix = res.app?.name;
  }

  private viaHttp(): Observable<void> {
    return this.appData$.pipe(map((res: NzSafeAny) => this.handleAppData(res)));
  }

  private viaMock(): Observable<void> {
    // const tokenData = this.tokenService.get();
    // if (!tokenData.token) {
    //   this.router.navigateByUrl(this.tokenService.login_url!);
    //   return;
    // }
    // mock
    const appName = 'داشبورد مدیریت';
    const app: App = {
      name: appName,
      description: 'پنل مدیریت عمومی بر پایهٔ Angular و ng-alain'
    };
    const user: User = {
      name: 'مدیر سیستم',
      avatar: './assets/tmp/img/avatar.jpg',
      email: 'admin@example.com',
      token: '123456789'
    };
    // Application information: including site name, description, year
    this.settingService.setApp(app);
    // User information: including name, avatar, email address
    this.settingService.setUser(user);
    // ACL: Set the permissions to full, https://ng-alain.com/acl/getting-started
    this.aclService.setFull(true);
    // Menu data, https://ng-alain.com/theme/menu
    // Only routes that actually exist are listed; the nested "صفحات خطا" branch is here so the
    // sidebar's collapsible submenus, the top-navigation dropdowns and the portal's group headings
    // all have something real to render. Step 6 replaces this with the user-management module.
    this.menuService.add([
      {
        text: 'منوی اصلی',
        group: true,
        children: [
          {
            text: 'داشبورد',
            link: '/dashboard',
            icon: { type: 'icon', value: 'dashboard' }
          }
        ]
      },
      {
        text: 'ابزارها',
        group: true,
        children: [
          {
            text: 'صفحات خطا',
            icon: { type: 'icon', value: 'warning' },
            children: [
              { text: 'دسترسی غیرمجاز', link: '/exception/403', icon: { type: 'icon', value: 'stop' } },
              { text: 'صفحه یافت نشد', link: '/exception/404', icon: { type: 'icon', value: 'file-search' } },
              { text: 'خطای سرور', link: '/exception/500', icon: { type: 'icon', value: 'cloud-server' } },
              { text: 'آزمون خطا', link: '/exception/trigger', icon: { type: 'icon', value: 'bug' } }
            ]
          },
          {
            text: 'قفل صفحه',
            link: '/passport/lock',
            icon: { type: 'icon', value: 'lock' }
          }
        ]
      }
    ]);
    // Can be set page suffix title, https://ng-alain.com/theme/title
    this.titleService.suffix = appName;

    return of(void 0);
  }

  load(): Observable<void> {
    // http
    // return this.viaHttp();
    // mock: Don’t use it in a production environment. ViaMock is just to simulate some data to make the scaffolding work normally
    return this.viaMock();
  }
}
