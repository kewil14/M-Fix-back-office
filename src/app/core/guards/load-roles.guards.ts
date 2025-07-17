import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Store } from "@ngrx/store";
import { findAllRoles } from "../shared/stores/role/role.actions";

@Injectable({ providedIn: 'root' })
export class LoadRolesGuard implements CanActivate{

    constructor(private storeService: Store){}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot){
        this.storeService.dispatch(findAllRoles());
        return true;
    }

}