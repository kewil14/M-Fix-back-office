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
        label: 'Devis',
        isTitle: true
    },
    {
        id: 10,
        label: 'Demande',
        icon: 'bx-envelope',
        link: '/admin/devis/demande',
    },
    {
        id: 11,
        label: 'Devis',
        icon: 'bx-file',
        link: '/admin/devis',
    },
    {
        id: 91,
        label: 'Grille tarifaire',
        icon: 'bx-file',
        link: '/admin/grille',
    },

    {
        id: 12,
        label: 'Avis',
        isTitle: true
    },
    {
        id: 13,
        label: 'Avis',
        icon: 'bx-star',
        link: '/admin/avis',
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
                label: 'Role',
                link: '/admin/autorisation/role',
                parentId: 67
            },
            {
                id: 70,
                label: 'Autorisation',
                link: '/admin/autorisation',
                parentId: 67
            },
        ]
    },
    
  
];

