import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { findAllDevis } from '../stores/devis/devis.actions';
import { findAllDemandes } from '../stores/demande/demande.actions';
import { SortEnum, StatusEnum } from '../../config/data.state.enum';

@Injectable({ providedIn: 'root' })
export class LoadDemandeGuard implements CanActivate {
    constructor(
        private storeService: Store,
        
    ) {}
    // tslint:disable-next-line: typedef
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        this.storeService.dispatch(findAllDemandes({state: StatusEnum.ALL, page: 0, size: 1000, sort: SortEnum.DESC}));
        return true;
    }
}

