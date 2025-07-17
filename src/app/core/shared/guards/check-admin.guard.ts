import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { checkStateAction } from '../stores/system-init/system-init.actions';
import { LocalStorageService } from '../services/local-storage.service';
import { catchError, map, of } from 'rxjs';
import { User } from '../models/users/user.modal';
import { RequestResultDto } from '../dtos/request-result-dto.modal';
import { UserService } from '../services/user.service';
import { setUserProfile } from '../stores/profile/profile.actions';

@Injectable({ providedIn: 'root' })
export class CheckAdminGuard implements CanActivate {
    constructor(
        private storeService: Store,
        private localStorageService: LocalStorageService,
        private router: Router,
        private userService: UserService,
    ) {}
    // tslint:disable-next-line: typedef
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        // this.storeService.dispatch(checkStateAction());
        if (!this.localStorageService.isTokenExpiredFin()) {
            return this.userService.connectedUser().pipe(
                map((data: RequestResultDto<User>) => {
                    if(data.status == 'SUCCESS') {
                        this.storeService.dispatch(setUserProfile({user: data.data || {}}));
                        return true;
                    } else {
                        this.router.navigate(['/'], { queryParams: { returnUrl: state.url }});
                        return false;
                    }
                }),
                catchError(() => {
                    this.router.navigate(['/'], { queryParams: { returnUrl: state.url }});
                    return of(false);
                })
            )
        } else {
            this.router.navigate(['/'], { queryParams: { returnUrl: state.url }});
              return false;
        }
    }
}

