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
        requiredRole: ['ADMIN', 'SUPER_ADMIN'],
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
                requiredRole: ['ADMIN', 'SUPER_ADMIN'],
            },
            {
                id: 70,
                label: 'MESSAGES.MENU.ADMINISTRATEURS',
                link: '/admin/admins',
                parentId: 67,
                requiredRole: ['ADMIN', 'SUPER_ADMIN'],
            },
            {
                id: 72,
                label: 'MESSAGES.MENU.WORKSPACE',
                link: '/admin/workspaces',
                parentId: 67,
                requiredRole: ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN'],
            },
            {
                id: 73,
                label: 'MESSAGES.MENU.SHOPS',
                link: '/admin/shops',
                parentId: 67,
                requiredRole: ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN', 'SHOP_MANAGER'],
            },
            {
                id: 69,
                label: 'MESSAGES.MENU.EMPLOYE',
                link: '/admin/employees',
                parentId: 67,
                requiredRole: ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN', 'SHOP_MANAGER'],
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
        requiredRole: ['ADMIN', 'SUPER_ADMIN'],
        subItems: [
            {
                id: 78,
                label: 'MESSAGES.MENU.ROLE',
                link: '/admin/autorisation/role',
                parentId: 77,
                requiredRole: ['ADMIN', 'SUPER_ADMIN'],
            },
            {
                id: 79,
                label: 'MESSAGES.MENU.AUTORISATION',
                link: '/admin/autorisation',
                parentId: 77,
                requiredRole: ['ADMIN', 'SUPER_ADMIN'],
            }
        ]
    },
    // Section Produits (Product Service)
    {
        id: 80,
        label: 'MESSAGES.MENU.PRODUCTS_TITLE',
        isTitle: true
    },
    {
        id: 81,
        label: 'MESSAGES.MENU.PRODUCTS',
        icon: 'bx-package',
        requiredRole: ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN', 'SHOP_MANAGER', 'EMPLOYEE'],
        subItems: [
            {
                id: 83,
                label: 'MESSAGES.MENU.PRODUCTS_BRANDS',
                link: '/admin/product-brands',
                parentId: 81,
                requiredRole: ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN', 'SHOP_MANAGER', 'EMPLOYEE'],
            },
            {
                id: 84,
                label: 'MESSAGES.MENU.PRODUCTS_CATEGORIES',
                link: '/admin/product-categories',
                parentId: 81,
                requiredRole: ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN', 'SHOP_MANAGER', 'EMPLOYEE'],
            },
            {
                id: 90,
                label: 'MESSAGES.MENU.PRODUCTS_TYPES',
                link: '/admin/product-types',
                parentId: 81,
                requiredRole: ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN', 'SHOP_MANAGER', 'EMPLOYEE'],
            },
            {
                id: 89,
                label: 'MESSAGES.MENU.PRODUCTS_VARIANTS',
                link: '/admin/product-variants',
                parentId: 81,
                requiredRole: ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN', 'SHOP_MANAGER', 'EMPLOYEE'],
            },
            {
                id: 91,
                label: 'MESSAGES.MENU.PRODUCTS_TAGS',
                link: '/admin/product-tags',
                parentId: 81,
                requiredRole: ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN', 'SHOP_MANAGER', 'EMPLOYEE'],
            },
            {
                id: 82,
                label: 'MESSAGES.MENU.PRODUCTS_LIST',
                link: '/admin/products',
                parentId: 81,
                requiredRole: ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN', 'SHOP_MANAGER', 'EMPLOYEE'],
            },
            {
                id: 85,
                label: 'MESSAGES.MENU.PRODUCTS_STOCK',
                link: '/admin/product-stock',
                parentId: 81,
                requiredRole: ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN', 'SHOP_MANAGER', 'EMPLOYEE'],
            },
            {
                id: 86,
                label: 'MESSAGES.MENU.PRODUCTS_PROMOTIONS',
                link: '/admin/product-promotions',
                parentId: 81,
                requiredRole: ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN', 'SHOP_MANAGER', 'EMPLOYEE'],
            },
            {
                id: 87,
                label: 'MESSAGES.MENU.PRODUCTS_ANALYTICS',
                link: '/admin/product-analytics',
                parentId: 81,
                requiredRole: ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN', 'SHOP_MANAGER'],
            }
        ]
    },
];

