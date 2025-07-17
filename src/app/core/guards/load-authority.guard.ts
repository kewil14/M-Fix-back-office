import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { findAllRoleItem } from '../shared/stores/role/role.actions';

/**
 * le CheckUserGuard n'as pas pour objectif de bloqué le route mais de charge l'utilisateur connecter
 */
@Injectable({ providedIn: 'root' })
export class LoadAuthorityGuard implements CanActivate {
    constructor(
        private storeService: Store
    ) {} 
 
    // methode de guard pourdispacher l'action du role item
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
  
        this.storeService.dispatch(findAllRoleItem());
        return true;
    }
}
