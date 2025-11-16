import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { LocalStorageService } from '../services/local-storage.service';

/**
 * Guard qui empêche l'accès à la page de login si l'utilisateur est déjà connecté
 */
@Injectable({ providedIn: 'root' })
export class LoggedInGuard implements CanActivate {
  constructor(
    private localStorageService: LocalStorageService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Si l'utilisateur est déjà connecté (token valide), rediriger vers le dashboard
    if (!this.localStorageService.isTokenExpiredFin()) {
      this.router.navigate(['/admin']);
      return false;
    }
    // Si l'utilisateur n'est pas connecté, autoriser l'accès à la page de login
    return true;
  }
}

