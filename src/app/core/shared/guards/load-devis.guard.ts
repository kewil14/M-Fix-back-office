import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { findAllDevis } from '../stores/devis/devis.actions';
import { SortEnum, StatusEnum } from '../../config/data.state.enum';

@Injectable({ providedIn: 'root' })
export class LoadDevisGuard implements CanActivate {
    constructor(
        private storeService: Store,
        
    ) {}
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        this.storeService.dispatch(findAllDevis({page: 0, state: StatusEnum.ALL, startDate: '2024-03-28T23:22:51.932', endDate: new Date().toISOString(), size: 1000, sort: SortEnum.DESC}));
        return true;
    }
}

