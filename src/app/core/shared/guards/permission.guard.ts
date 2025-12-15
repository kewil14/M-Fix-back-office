import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { LocalStorageService } from '../services/local-storage.service';
import { PermissionService } from '../services/permission.service';

@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanActivate {
  constructor(
    private permissionService: PermissionService,
    private localStorageService: LocalStorageService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Vérifier si le token est valide (existe et n'est pas expiré)
    if (!this.permissionService.isTokenValid()) {
      console.log('Token invalide ou expiré, redirection vers login');
      this.router.navigate(['/'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    // Bloquer l'accès des SHOP_MANAGER à la route /admin/shops
    // Les SHOP_MANAGER ne doivent pas voir les autres shops
    if (state.url.startsWith('/admin/shops') && this.permissionService.isShopManager()) {
      console.log('Accès refusé - SHOP_MANAGER ne peut pas accéder à la liste des shops');
      this.router.navigate(['/admin']);
      return false;
    }

    // Récupérer les permissions requises depuis la route
    const requiredPermissions = route.data['permissions'] as string[];
    const requiredRoles = route.data['roles'] as string[];
    const requiredUserTypes = route.data['userTypes'] as string[];
    const requireAnyPermission = route.data['requireAnyPermission'] as boolean || false;

    // Vérifier les userTypes d'abord
    if (requiredUserTypes && requiredUserTypes.length > 0) {
      const userType = this.permissionService.getUserType();
      const isSuperAdmin = this.permissionService.isSuperAdmin();
      const isAdmin = this.permissionService.isAdmin();
      
      // Super Admin a accès à tous les userTypes
      if (isSuperAdmin) {
        console.log('Accès autorisé - Super Admin a accès à tous les userTypes');
      } 
      // Admin a accès à tous les userTypes sauf SUPER_ADMIN (mais peut-être qu'on veut aussi leur donner accès?)
      else if (isAdmin) {
        console.log('Accès autorisé - Admin a accès aux routes admin');
      }
      else if (!userType || !requiredUserTypes.includes(userType)) {
        console.log('UserType requis non trouvé. Requis:', requiredUserTypes, 'Actuel:', userType);
        return false;
      }
      console.log('UserType vérifié avec succès:', requiredUserTypes);
    }

    // Si aucune permission ou rôle requis, autoriser l'accès (juste vérifier l'authentification)
    if ((!requiredPermissions || requiredPermissions.length === 0) && 
        (!requiredRoles || requiredRoles.length === 0)) {
      console.log('Aucune permission/rôle requis, accès autorisé (token valide)');
      return true;
    }

    // Vérifier les rôles
    if (requiredRoles && requiredRoles.length > 0) {
      // Traiter SUPERADMIN comme SUPER_ADMIN (alias)
      const normalizedRoles = requiredRoles.map(role => role === 'SUPERADMIN' ? 'SUPER_ADMIN' : role);
      
      // Si SUPER_ADMIN est requis, vérifier explicitement isSuperAdmin()
      if (normalizedRoles.includes('SUPER_ADMIN')) {
        const isSuperAdmin = this.permissionService.isSuperAdmin();
        if (isSuperAdmin) {
          console.log('Accès autorisé - Super Admin vérifié');
          return true;
        } else {
          console.log('Accès refusé - Super Admin requis mais utilisateur n\'est pas Super Admin');
          return false;
        }
      }
      
      const hasRole = this.permissionService.hasAnyRole(normalizedRoles);
      if (!hasRole) {
        console.log('Rôle requis non trouvé. Requis:', normalizedRoles, 'Disponibles:', this.permissionService.getRoles());
        // Ne pas rediriger vers 403, simplement bloquer l'accès
        return false;
      }
      console.log('Rôle vérifié avec succès:', normalizedRoles);
    }

    // Vérifier les permissions
    if (requiredPermissions && requiredPermissions.length > 0) {
      // Super Admin et Admin ont accès à toutes les permissions
      const isSuperAdmin = this.permissionService.isSuperAdmin();
      const isAdmin = this.permissionService.isAdmin();
      
      if (isSuperAdmin || isAdmin) {
        console.log('Accès autorisé - Super Admin ou Admin ont accès à toutes les permissions');
        return true;
      }
      
      // Workspace Admins et Shop Managers ont automatiquement accès aux produits
      const isWorkspaceAdmin = this.permissionService.isWorkspaceAdmin();
      const isShopManager = this.permissionService.isShopManager();
      const isProductPermission = requiredPermissions.some(p => p.startsWith('products:'));
      
      if (isProductPermission && (isWorkspaceAdmin || isShopManager)) {
        console.log('Accès autorisé pour Workspace Admin ou Shop Manager aux routes produits');
        return true;
      }
      
      const hasPermission = requireAnyPermission
        ? this.permissionService.hasAnyPermission(requiredPermissions)
        : this.permissionService.hasAllPermissions(requiredPermissions);

      if (!hasPermission) {
        console.log('Permission requise non trouvée. Requises:', requiredPermissions, 'Disponibles:', this.permissionService.getPermissions());
        // Ne pas rediriger vers 403, simplement bloquer l'accès
        return false;
      }
      console.log('Permissions vérifiées avec succès:', requiredPermissions);
    }

    return true;
  }
}

