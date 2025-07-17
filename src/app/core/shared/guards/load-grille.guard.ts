import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { findAllGrilles } from '../stores/grille/grille.actions';

@Injectable({ providedIn: 'root' })
export class LoadGrilleGuard implements CanActivate {
    constructor(
        private storeService: Store,
        
    ) {}
    // tslint:disable-next-line: typedef
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        this.storeService.dispatch(findAllGrilles());
        return true;
    }
}

