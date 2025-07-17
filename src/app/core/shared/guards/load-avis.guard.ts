import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { findAllAvis } from '../stores/avis/avis.actions';

@Injectable({ providedIn: 'root' })
export class LoadAvisGuard implements CanActivate {
    constructor(
        private storeService: Store,
        
    ) {}
    // tslint:disable-next-line: typedef
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        this.storeService.dispatch(findAllAvis());
        return true;
    }
}

