import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
    {
        id: 1,
        label: 'MESSAGES.MENU.DASHBOARD',
        isTitle: true
    },
    {
        id: 2,
        label: 'MESSAGES.MENU.DASHBOARD',
        icon: 'bx-home-circle',
        subItems: [
            {
                id: 3,
                label: 'MESSAGES.MENU.DASHBOARD',
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
        label: 'MESSAGES.MENU.INVITATION',
        icon: 'bx-envelope',
        link: '/admin/invitations',
        visibleForSuperAdmin: true,
    },
    
    {
        id: 66,
        label: 'MESSAGES.MENU.USERS_TITLE',
        isTitle: true
    },
    {
        id: 67,
        label: 'MESSAGES.MENU.USERS',
        icon: 'bx-user-circle',
        subItems: [
            {
                id: 68,
                label: 'MESSAGES.MENU.USERS',
                link: '/admin/users',
                parentId: 67,
                visibleForSuperAdmin: true
            },
            {
                id: 70,
                label: 'MESSAGES.MENU.ADMINISTRATEURS',
                link: '/admin/admins',
                parentId: 67,
                visibleForSuperAdmin: true
            },
            {
                id: 72,
                label: 'MESSAGES.MENU.WORKSPACE',
                link: '/admin/workspaces',
                parentId: 67
            },
            {
                id: 73,
                label: 'MESSAGES.MENU.SHOPS',
                link: '/admin/shops',
                parentId: 67
            },
            {
                id: 69,
                label: 'MESSAGES.MENU.EMPLOYE',
                link: '/admin/employees',
                parentId: 67
            },
        ]
    },

    {
        id: 76,
        label: 'MESSAGES.MENU.PERMISSIONS',
        isTitle: true
    },
    {
        id: 77,
        label: 'MESSAGES.MENU.PERMISSIONS',
        icon: 'bx-shield-quarter',
        visibleForSuperAdmin: true,
        subItems: [
            {
                id: 78,
                label: 'MESSAGES.MENU.ROLE',
                link: '/admin/autorisation/role',
                parentId: 77,
                visibleForSuperAdmin: true
            },
            {
                id: 79,
                label: 'MESSAGES.MENU.AUTORISATION',
                link: '/admin/autorisation',
                parentId: 77,
                visibleForSuperAdmin: true
            }
        ]
    }
];

