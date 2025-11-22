import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { LocalStorageService } from '../services/local-storage.service';
import { of } from 'rxjs';
import { setUserProfile } from '../stores/profile/profile.actions';

@Injectable({ providedIn: 'root' })
export class CheckAdminGuard implements CanActivate {
    constructor(
        private storeService: Store,
        private localStorageService: LocalStorageService,
        private router: Router,
    ) {}
    
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (!this.localStorageService.isTokenExpiredFin()) {
            const localUser = this.localStorageService.currentUserValue;
            if (localUser && Object.keys(localUser).length > 0) {
                this.storeService.dispatch(setUserProfile({user: localUser}));
                return of(true);
            }
            return of(true);
        } else {
            this.router.navigate(['/'], { queryParams: { returnUrl: state.url }});
            return of(false);
        }
    }
}

