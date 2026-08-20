import { Component, OnInit, inject } from '@angular/core';
import { NavigationEnd, NavigationError, RouteConfigLoadStart, Router, RouterOutlet } from '@angular/router';
import { TitleService, VERSION as VERSION_ALAIN, stepPreloader } from '@delon/theme';
import { environment } from '@env/environment';
import { NzModalService } from 'ng-zorro-antd/modal';
import { VERSION as VERSION_ZORRO } from 'ng-zorro-antd/version';

@Component({
  selector: 'app-root',
  template: `<router-outlet />`,
  imports: [RouterOutlet],
  host: {
    '[attr.ng-alain-version]': 'ngAlainVersion',
    '[attr.ng-zorro-version]': 'ngZorroVersion'
  }
})
export class AppComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly titleSrv = inject(TitleService);
  private readonly modalSrv = inject(NzModalService);
  ngAlainVersion = VERSION_ALAIN.full;
  ngZorroVersion = VERSION_ZORRO.full;

  private donePreloader = stepPreloader();

  ngOnInit(): void {
    let configLoad = false;
    this.router.events.subscribe(ev => {
      if (ev instanceof RouteConfigLoadStart) {
        configLoad = true;
      }
      if (configLoad && ev instanceof NavigationError) {
        this.modalSrv.confirm({
          nzTitle: 'اطلاع',
          nzContent: environment.production
            ? 'به نظر می‌رسد نسخهٔ جدیدی از برنامه منتشر شده است. برای اعمال تغییرات، صفحه را به‌روزرسانی کنید.'
            : `بارگذاری مسیر ممکن نشد: ${ev.url}`,
          nzCancelDisabled: false,
          nzOkText: 'به‌روزرسانی',
          nzCancelText: 'نادیده گرفتن',
          nzOnOk: () => location.reload()
        });
      }
      if (ev instanceof NavigationEnd) {
        this.donePreloader();
        this.titleSrv.setTitle();
        this.modalSrv.closeAll();
      }
    });
  }
}
