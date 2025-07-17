import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { checkStateAction } from '../stores/system-init/system-init.actions';
import { findAllAvis, findAllAvisByState } from '../stores/avis/avis.actions';
import { findAllUsers } from '../stores/user/user.actions';
import { UserTypeEnum } from '../../config/list-roles';
import { SortEnum } from '../../config/data.state.enum';
import { findAllDevis } from '../stores/devis/devis.actions';
import { AvisStateEnum } from 'src/app/core/config/data.state.enum';

@Injectable({ providedIn: 'root' })
export class CheckInitStateGuard implements CanActivate {
    constructor(
        private storeService: Store,
        
    ) {}
    // tslint:disable-next-line: typedef
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        this.storeService.dispatch(checkStateAction());
        this.storeService.dispatch(findAllAvisByState({state: AvisStateEnum.APPROUVE}));
        this.storeService.dispatch(findAllUsers({userType: UserTypeEnum.CUSTOMER, page: 0, size: 1000, sort: SortEnum.DESC}));
        this.storeService.dispatch(findAllDevis({page: 0, size: 1000, sort: SortEnum.DESC, endDate: new Date().toISOString(), }));
        return true;
    }
}

