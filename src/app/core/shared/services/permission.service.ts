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
    if (!decoded || !decoded.permissions) {
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
    return this.hasRole('SUPERADMIN') || decoded?.type === 'SUPER_ADMIN';
  }

  /**
   * Vérifie si l'utilisateur est un Admin
   */
  isAdmin(): boolean {
    const decoded = this.getDecodedToken();
    return decoded?.type === 'ADMIN' || this.hasRole('SUPERADMIN');
  }

  /**
   * Vérifie si l'utilisateur est un Workspace Admin
   */
  isWorkspaceAdmin(): boolean {
    const decoded = this.getDecodedToken();
    return decoded?.type === 'WORKSPACE_ADMIN';
  }

  /**
   * Retourne le type d'utilisateur
   */
  getUserType(): string | null {
    const decoded = this.getDecodedToken();
    return decoded?.type || null;
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

