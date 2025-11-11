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
        link: '/admin/devis/demande',
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
                label: 'Clients',
                link: '/admin/customers',
                parentId: 67
            },
            {
                id: 69,
                label: 'Employe',
                link: '/admin/autorisation/role',
                parentId: 67
            },
            {
                id: 70,
                label: 'Administrateurs',
                link: '/admin/autorisation',
                parentId: 67
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
        icon: 'bx-user-circle',
        subItems: [
            {
                id: 78,
                label: 'Role',
                link: '',
                parentId: 67
            },
            {
                id: 79,
                label: 'Autorisation',
                link: '',
                parentId: 67
            }
        ]
    },
    
  
];

