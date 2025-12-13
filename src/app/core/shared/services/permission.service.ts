import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { JwtHelperService } from '@auth0/angular-jwt';

export interface DecodedToken {
  permissions?: string[];
  roles?: string[];
  type?: string;
  userId?: string;
  email?: string;
  sub?: string;
  iat?: number;
  exp?: number;
  workspaceId?: string;
  workspace_id?: string;
  workspace?: string;
  [key: string]: any; // Pour permettre d'autres propriétés
}

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private jwtHelper = new JwtHelperService();

  constructor(private localStorageService: LocalStorageService) {}

  /**
   * Décode le token JWT et retourne les données décodées
   */
  getDecodedToken(): DecodedToken | null {
    const token = this.localStorageService.currentTokenValueFin;
    if (!token) {
      console.log('PermissionService - Aucun token trouvé');
      return null;
    }

    try {
      const decoded = this.jwtHelper.decodeToken(token);
      console.log('PermissionService - Token décodé:', decoded);
      return decoded as DecodedToken;
    } catch (error) {
      console.error('PermissionService - Erreur lors du décodage du token:', error);
      return null;
    }
  }

  /**
   * Vérifie si l'utilisateur a une permission spécifique
   * @param permission La permission à vérifier (ex: "admins:create")
   */
  hasPermission(permission: string): boolean {
    const decoded = this.getDecodedToken();
    if (!decoded) {
      return false;
    }
    
    // Super Admin et Admin ont accès à toutes les permissions
    if (this.isSuperAdmin() || this.isAdmin()) {
      return true;
    }
    
    if (!decoded.permissions) {
      return false;
    }
    return decoded.permissions.includes(permission);
  }

  /**
   * Vérifie si l'utilisateur a au moins une des permissions spécifiées
   */
  hasAnyPermission(permissions: string[]): boolean {
    if (!permissions || permissions.length === 0) {
      return true; // Si aucune permission requise, autoriser
    }
    return permissions.some(permission => this.hasPermission(permission));
  }

  /**
   * Vérifie si l'utilisateur a tous les permissions spécifiées
   */
  hasAllPermissions(permissions: string[]): boolean {
    if (!permissions || permissions.length === 0) {
      return true;
    }
    return permissions.every(permission => this.hasPermission(permission));
  }

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  hasRole(role: string): boolean {
    const decoded = this.getDecodedToken();
    
    // Super Admin et Admin ont accès à tous les rôles
    if (this.isSuperAdmin() || this.isAdmin()) {
      return true;
    }
    
    if (!decoded || !decoded.roles) {
      return false;
    }
    return decoded.roles.includes(role);
  }

  /**
   * Vérifie si l'utilisateur a au moins un des rôles spécifiés
   */
  hasAnyRole(roles: string[]): boolean {
    if (!roles || roles.length === 0) {
      return true;
    }
    return roles.some(role => this.hasRole(role));
  }

  /**
   * Vérifie si l'utilisateur est un SuperAdmin
   */
  isSuperAdmin(): boolean {
    const decoded = this.getDecodedToken();
    // Directement vérifier le type du token pour éviter la récursion
    return decoded?.type === 'SUPER_ADMIN';
  }

  /**
   * Vérifie si l'utilisateur est un Admin
   */
  isAdmin(): boolean {
    const decoded = this.getDecodedToken();
    // Directement vérifier le type du token pour éviter la récursion
    return decoded?.type === 'ADMIN' || decoded?.type === 'SUPER_ADMIN';
  }

  /**
   * Vérifie si l'utilisateur est un Workspace Admin
   */
  isWorkspaceAdmin(): boolean {
    const decoded = this.getDecodedToken();
    return decoded?.type === 'WORKSPACE_ADMIN';
  }

  /**
   * Vérifie si l'utilisateur est un Shop Manager
   */
  isShopManager(): boolean {
    const decoded = this.getDecodedToken();
    return decoded?.type === 'SHOP_MANAGER';
  }

  /**
   * Vérifie si l'utilisateur est un Employee
   */
  isEmployee(): boolean {
    const decoded = this.getDecodedToken();
    return decoded?.type === 'EMPLOYEE';
  }

  /**
   * Vérifie si l'utilisateur est un Technician
   */
  isTechnician(): boolean {
    const decoded = this.getDecodedToken();
    return decoded?.type === 'TECHNICIAN';
  }

  /**
   * Vérifie si l'utilisateur est un Deliverer
   */
  isDeliverer(): boolean {
    const decoded = this.getDecodedToken();
    return decoded?.type === 'DELIVERER';
  }

  /**
   * Retourne le type d'utilisateur
   */
  getUserType(): string | null {
    const decoded = this.getDecodedToken();
    return decoded?.type || null;
  }

  /**
   * Vérifie si l'utilisateur peut accéder à une page spécifique
   * Basé sur le chemin de la route
   */
  canAccessPage(route: string): boolean {
    const userType = this.getUserType();
    if (!userType) return false;

    // Super Admin et Admin ont accès à toutes les pages
    if (this.isSuperAdmin() || this.isAdmin()) {
      return true;
    }

    // Mapping des routes aux rôles autorisés
    const routePermissions: { [key: string]: string[] } = {
      // Dashboard - accessible à tous les rôles authentifiés
      '/admin': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN', 'SHOP_MANAGER', 'EMPLOYEE', 'TECHNICIAN', 'DELIVERER'],
      
      // Gestion des utilisateurs - ADMIN uniquement
      '/admin/users': ['ADMIN', 'SUPER_ADMIN'],
      '/admin/admins': ['ADMIN', 'SUPER_ADMIN'],
      '/admin/invitations': ['ADMIN', 'SUPER_ADMIN'],
      
      // Workspaces - ADMIN et WORKSPACE_ADMIN
      '/admin/workspaces': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN'],
      
      // Shops - ADMIN, WORKSPACE_ADMIN, SHOP_MANAGER
      '/admin/shops': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN', 'SHOP_MANAGER'],
      
      // Employees - ADMIN, WORKSPACE_ADMIN, SHOP_MANAGER
      '/admin/employees': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN', 'SHOP_MANAGER'],
      
      // Permissions - ADMIN uniquement
      '/admin/autorisation': ['ADMIN', 'SUPER_ADMIN'],
      '/admin/autorisation/role': ['ADMIN', 'SUPER_ADMIN'],
      
      // Produits - ADMIN, WORKSPACE_ADMIN, SHOP_MANAGER, EMPLOYEE (avec permissions)
      '/admin/products': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN', 'SHOP_MANAGER', 'EMPLOYEE'],
      '/admin/product-brands': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN', 'SHOP_MANAGER', 'EMPLOYEE'],
      '/admin/product-categories': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN', 'SHOP_MANAGER', 'EMPLOYEE'],
      '/admin/product-types': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN', 'SHOP_MANAGER', 'EMPLOYEE'],
      '/admin/product-variants': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN', 'SHOP_MANAGER', 'EMPLOYEE'],
      '/admin/product-tags': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN', 'SHOP_MANAGER', 'EMPLOYEE'],
      '/admin/product-stock': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN', 'SHOP_MANAGER', 'EMPLOYEE'],
      '/admin/product-promotions': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN', 'SHOP_MANAGER', 'EMPLOYEE'],
      '/admin/product-analytics': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN', 'SHOP_MANAGER'],
    };

    const allowedRoles = routePermissions[route];
    if (!allowedRoles) {
      // Si la route n'est pas dans la liste, autoriser par défaut (pour compatibilité)
      // Mais logger un avertissement
      console.warn(`[PermissionService] Route non définie dans les permissions: ${route}`);
      return true;
    }

    return allowedRoles.includes(userType);
  }

  /**
   * Vérifie si l'utilisateur peut créer une entité
   */
  canCreate(entityType: 'user' | 'admin' | 'workspace' | 'shop' | 'employee' | 'product' | 'category' | 'brand' | 'productType' | 'tag' | 'variant' | 'sale' | 'repair' | 'delivery'): boolean {
    const userType = this.getUserType();
    if (!userType) return false;

    // Super Admin et Admin peuvent tout créer
    if (this.isSuperAdmin() || this.isAdmin()) {
      return true;
    }

    const createPermissions: { [key: string]: string[] } = {
      'user': ['ADMIN', 'SUPER_ADMIN'],
      'admin': ['ADMIN', 'SUPER_ADMIN'],
      'workspace': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN'],
      'shop': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN'],
      'employee': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN', 'SHOP_MANAGER'],
      'product': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN'],
      'category': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN'],
      'brand': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN'],
      'productType': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN'],
      'tag': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN', 'SHOP_MANAGER'],
      'variant': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN', 'SHOP_MANAGER'],
      'sale': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN', 'SHOP_MANAGER', 'EMPLOYEE'],
      'repair': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN', 'SHOP_MANAGER', 'TECHNICIAN'],
      'delivery': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN', 'SHOP_MANAGER', 'DELIVERER'],
    };

    const allowedRoles = createPermissions[entityType];
    return allowedRoles ? allowedRoles.includes(userType) : false;
  }

  /**
   * Vérifie si l'utilisateur peut modifier une entité
   */
  canEdit(entityType: 'user' | 'admin' | 'workspace' | 'shop' | 'employee' | 'product' | 'category' | 'brand' | 'productType' | 'tag' | 'variant' | 'sale' | 'repair' | 'delivery'): boolean {
    const userType = this.getUserType();
    if (!userType) return false;

    // Super Admin et Admin peuvent tout modifier
    if (this.isSuperAdmin() || this.isAdmin()) {
      return true;
    }

    const editPermissions: { [key: string]: string[] } = {
      'user': ['ADMIN', 'SUPER_ADMIN'],
      'admin': ['ADMIN', 'SUPER_ADMIN'],
      'workspace': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN'],
      'shop': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN'],
      'employee': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN', 'SHOP_MANAGER'],
      'product': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN'],
      'category': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN'],
      'brand': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN'],
      'productType': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN'],
      'tag': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN', 'SHOP_MANAGER'],
      'variant': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN', 'SHOP_MANAGER'],
      'sale': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN', 'SHOP_MANAGER', 'EMPLOYEE'],
      'repair': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN', 'SHOP_MANAGER', 'TECHNICIAN'],
      'delivery': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN', 'SHOP_MANAGER', 'DELIVERER'],
    };

    const allowedRoles = editPermissions[entityType];
    return allowedRoles ? allowedRoles.includes(userType) : false;
  }

  /**
   * Vérifie si l'utilisateur peut supprimer une entité
   */
  canDelete(entityType: 'user' | 'admin' | 'workspace' | 'shop' | 'employee' | 'product' | 'category' | 'brand' | 'productType' | 'tag' | 'variant' | 'sale' | 'repair' | 'delivery'): boolean {
    const userType = this.getUserType();
    if (!userType) return false;

    // Super Admin et Admin peuvent tout supprimer
    if (this.isSuperAdmin() || this.isAdmin()) {
      return true;
    }

    const deletePermissions: { [key: string]: string[] } = {
      'user': ['ADMIN', 'SUPER_ADMIN'],
      'admin': ['ADMIN', 'SUPER_ADMIN'],
      'workspace': ['ADMIN', 'SUPER_ADMIN'],
      'shop': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN'],
      'employee': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN'],
      'product': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN'],
      'category': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN'],
      'brand': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN'],
      'productType': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN'],
      'tag': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN'],
      'variant': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN', 'SHOP_MANAGER'],
      'sale': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN', 'SHOP_MANAGER'],
      'repair': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN', 'SHOP_MANAGER'],
      'delivery': ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN', 'SHOP_MANAGER'],
    };

    const allowedRoles = deletePermissions[entityType];
    return allowedRoles ? allowedRoles.includes(userType) : false;
  }

  /**
   * Vérifie si l'utilisateur peut voir les rapports/analytics
   */
  canViewReports(): boolean {
    const userType = this.getUserType();
    if (!userType) return false;

    // Super Admin, Admin, Workspace Admin, Shop Manager peuvent voir les rapports
    return ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN', 'SHOP_MANAGER'].includes(userType);
  }

  /**
   * Récupère l'ID de la boutique (shop) de l'utilisateur connecté
   */
  getShopId(): string | null {
    const decoded = this.getDecodedToken();
    if (!decoded) {
      return null;
    }
    const shopId = (decoded as any)?.shopId || (decoded as any)?.shop_id || (decoded as any)?.shop;
    return shopId ? String(shopId) : null;
  }

  /**
   * Récupère l'ID du workspace de l'utilisateur connecté
   */
  getWorkspaceId(): string | null {
    const decoded = this.getDecodedToken();
    if (!decoded) {
      return null;
    }
    
    // Essayer différents noms de champs possibles
    const workspaceId = (decoded as any)?.workspaceId || 
                       (decoded as any)?.workspace_id || 
                       (decoded as any)?.workspace ||
                       (decoded as any)?.workspaceId;
    
    if (workspaceId) {
      return String(workspaceId);
    }
    
    // Debug: afficher toutes les clés du token
    console.log('PermissionService - Token keys:', Object.keys(decoded || {}));
    console.log('PermissionService - Full decoded token:', decoded);
    
    return null;
  }

  /**
   * Retourne toutes les permissions de l'utilisateur
   */
  getPermissions(): string[] {
    const decoded = this.getDecodedToken();
    const permissions = decoded?.permissions || [];
    console.log('PermissionService - Permissions extraites du token:', permissions);
    return permissions;
  }

  /**
   * Retourne tous les rôles de l'utilisateur
   */
  getRoles(): string[] {
    const decoded = this.getDecodedToken();
    return decoded?.roles || [];
  }

  /**
   * Vérifie si le token est valide et non expiré
   */
  isTokenValid(): boolean {
    const token = this.localStorageService.currentTokenValueFin;
    if (!token) {
      return false;
    }
    return !this.jwtHelper.isTokenExpired(token);
  }
}

