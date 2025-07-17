import { TokenStorageService } from '../services/token-storage.service';
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { LocalStorageService } from '../services/local-storage.service';

@Injectable({ providedIn: 'root' })
export class CheckAuthGuard implements CanActivate {
    constructor(
        private localStorageService: LocalStorageService,
        private router: Router,
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let url = route.queryParams['returnUrl'] || '/';
        if(this.localStorageService.isTokenExpiredFin()) {
            return true;
        } else {
            this.router.navigateByUrl(url);
            return false;
        }
    }
}
