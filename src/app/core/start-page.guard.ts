import { CanActivateFn } from '@angular/router';
import { Observable } from 'rxjs';

/**
 * Dynamically load the start page
 */
export const startPageGuard: CanActivateFn = (): boolean | Observable<boolean> => {
  // Redirect based on the first menu item; customise this logic as needed
  // const menuSrv = inject(MenuService);
  // if (menuSrv.find({ url: state.url }) == null) {
  //   inject(Router).navigateByUrl(menuSrv.menus[0].link!);
  //   return false;
  // }
  return true;
};
