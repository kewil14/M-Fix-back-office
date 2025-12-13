export interface MenuItem {
    id?: number;
    label?: string;
    icon?: string;
    link?: string;
    subItems?: MenuItem[];
    isTitle?: boolean;
    badge?: any;
    parentId?: number;
    isLayout?: boolean;
    requiredRole?: string | string[];
    visibleForSuperAdmin?: boolean;
    // Permissions granulaires pour chaque action
    canView?: boolean; // Par défaut true si non spécifié
    canCreate?: boolean; // Bouton de création visible
    canEdit?: boolean; // Bouton d'édition visible
    canDelete?: boolean; // Bouton de suppression visible
}
