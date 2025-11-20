import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
    {
        id: 1,
        label: 'Dashboard',
        isTitle: true
    },
    {
        id: 2,
        label: 'Dashboard',
        icon: 'bx-home-circle',
        subItems: [
            {
                id: 3,
                label: 'Dashboard',
                link: '/admin',
                parentId: 2
            },
        ]
    },
    {
        id: 8,
        isLayout: true
    },

    {
        id: 9,
        label: '',
        isTitle: true
    },
    {
        id: 10,
        label: 'Demande',
        icon: 'bx-envelope',
        link: '/admin/invitations',
        visibleForSuperAdmin: true,
    },
    
    {
        id: 66,
        label: 'users',
        isTitle: true
    },
    {
        id: 67,
        label: 'Utilisateurs',
        icon: 'bx-user-circle',
        subItems: [
            {
                id: 68,
                label: 'Users',
                link: '/admin/users',
                parentId: 67,
                visibleForSuperAdmin: true  // Seulement pour super admin
            },
            {
                id: 70,
                label: 'Administrateurs',
                link: '/admin/admins',
                parentId: 67,
                visibleForSuperAdmin: true  // Seulement pour super admin
            },
            {
                id: 72,
                label: 'Workspace',
                link: '/admin/workspaces',
                parentId: 67
                // Visible pour super admin et workspace admin
            },
            {
                id: 73,
                label: 'Shops',
                link: '/admin/shops',
                parentId: 67
                // Visible pour super admin et workspace admin
            },
            {
                id: 69,
                label: 'Employe',
                link: '/admin/employees',
                parentId: 67
                // Visible pour super admin et workspace admin
            },
        ]
    },

    {
        id: 76,
        label: 'Permissions',
        isTitle: true
    },
    {
        id: 77,
        label: 'Permissions',
        icon: 'bx-shield-quarter',
        visibleForSuperAdmin: true,  // Seulement pour super admin
        subItems: [
            {
                id: 78,
                label: 'Role',
                link: '/admin/autorisation/role',
                parentId: 77,
                visibleForSuperAdmin: true
            },
            {
                id: 79,
                label: 'Autorisation',
                link: '/admin/autorisation',
                parentId: 77,
                visibleForSuperAdmin: true
            }
        ]
    },
    
  
];

