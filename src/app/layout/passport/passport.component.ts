import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalFooterModule } from '@delon/abc/global-footer';
import { DA_SERVICE_TOKEN } from '@delon/auth';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'layout-passport',
  template: `
    <div class="container">
      <div class="wrap">
        <div class="top">
          <div class="head">
            <img class="logo" src="./assets/logo-color.svg" />
            <span class="title">داشبورد مدیریت</span>
          </div>
          <div class="desc">سامانهٔ مدیریت یکپارچه — برای ادامه وارد حساب کاربری خود شوید</div>
        </div>
        <router-outlet />
        <global-footer [links]="links">
          <nz-icon nzType="copyright" />
          <span class="ltr-text">۱۴۰۵</span>
          — داشبورد مدیریت
        </global-footer>
      </div>
    </div>
  `,
  styleUrls: ['./passport.component.less'],
  imports: [RouterOutlet, GlobalFooterModule, NzIconModule]
})
export class LayoutPassportComponent implements OnInit {
  private tokenService = inject(DA_SERVICE_TOKEN);

  links = [
    {
      title: 'راهنما',
      href: ''
    },
    {
      title: 'حریم خصوصی',
      href: ''
    },
    {
      title: 'شرایط استفاده',
      href: ''
    }
  ];

  ngOnInit(): void {
    this.tokenService.clear();
  }
}
