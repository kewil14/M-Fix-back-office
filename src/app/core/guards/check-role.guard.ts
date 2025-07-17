import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { LocalStorageService } from '../shared/services/local-storage.service';
import { findRoleById } from '../shared/stores/role/role.actions';

@Injectable({ providedIn: 'root' })
export class CheckRoleGuard implements CanActivate {
    constructor(
        private localStorageService: LocalStorageService,
        private storeService: Store,
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if(!this.localStorageService.isTokenExpiredFin() && route.paramMap.get('idRole') as any != 0) {
            this.storeService.dispatch(findRoleById({idRole: route.paramMap.get('idRole')}));
            return true;
        } else {
            return true;
        }
    }
}
