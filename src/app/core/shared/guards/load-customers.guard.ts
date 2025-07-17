import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { checkStateAction } from '../stores/system-init/system-init.actions';
import { findAllUsers } from '../stores/user/user.actions';
import { SortEnum, UserStateEnum } from '../../config/data.state.enum';
import { UserTypeEnum } from '../../config/list-roles';

@Injectable({ providedIn: 'root' })
export class LoadCustomerGuard implements CanActivate {
    constructor(
        private storeService: Store,
        
    ) {}
    // tslint:disable-next-line: typedef
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        this.storeService.dispatch(findAllUsers({ userType: UserTypeEnum.CUSTOMER, page: 0, size: 1000, sort: SortEnum.DESC}));
        return true;
    }
}

