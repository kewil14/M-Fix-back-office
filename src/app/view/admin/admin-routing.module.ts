import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminDashboardComponent } from './dashboard/admin-dashboard/admin-dashboard.component';
import { WorkspaceAdminDashboardComponent } from './dashboard/workspace-admin-dashboard/workspace-admin-dashboard.component';
import { ShopManagerDashboardComponent } from './dashboard/shop-manager-dashboard/shop-manager-dashboard.component';
import { TechnicianDashboardComponent } from './dashboard/technician-dashboard/technician-dashboard.component';
import { DelivererDashboardComponent } from './dashboard/deliverer-dashboard/deliverer-dashboard.component';
import { CustomersComponent } from './customers/customers.component';
import { LoadCustomerGuard } from 'src/app/core/shared/guards/load-customers.guard';
import { LoadGrilleGuard } from 'src/app/core/shared/guards/load-grille.guard';
import { LoadDemandeGuard } from 'src/app/core/shared/guards/load-demande.guard';
import { PermissionGuard } from 'src/app/core/shared/guards/permission.guard';
import { DemandeComponent } from './devis/demande/demande.component';
import { UsersManagementComponent } from './users/users-management/users-management.component';
import { AdminsComponent } from './users/admins/admins.component';
import { WorkspacesComponent } from './users/workspaces/workspaces.component';
import { EmployeesComponent } from './users/employees/employees.component';
import { EmployeeDetailComponent } from './users/employee-detail/employee-detail.component';
import { EmployeeEditComponent } from './users/employee-edit/employee-edit.component';
import { AdminDetailComponent } from './users/admin-detail/admin-detail.component';
import { AdminEditComponent } from './users/admin-edit/admin-edit.component';
import { InvitationsComponent } from './users/invitations/invitations.component';
import { InvitationDetailComponent } from './users/invitation-detail/invitation-detail.component';
import { ShopsComponent } from './shops/shops.component';
import { ShopDetailComponent } from './shops/shop-detail/shop-detail.component';
import { ShopEditComponent } from './shops/shop-edit/shop-edit.component';
import { AdminProductsComponent } from './products/products.component';
import { ProductBrandsComponent } from './products/product-brands.component';
import { BrandEditComponent } from './products/brand-edit.component';
import { BrandDetailComponent } from './products/brand-detail.component';
import { ProductCategoriesComponent } from './products/product-categories.component';
import { CategoryEditComponent } from './products/category-edit.component';
import { CategoryDetailComponent } from './products/category-detail.component';
import { ProductStockComponent } from './products/product-stock.component';
import { ProductVariantsComponent } from './products/product-variants.component';
import { ProductPromotionsComponent } from './products/product-promotions.component';
import { ProductAnalyticsComponent } from './products/product-analytics.component';
import { ProductDetailComponent } from './products/product-detail.component';
import { ProductEditComponent } from './products/product-edit.component';
import { ProductTypesComponent } from './products/product-types.component';
import { ProductTypeEditComponent } from './products/product-type-edit.component';
import { ProductTypeDetailComponent } from './products/product-type-detail.component';
import { ProductTagsComponent } from './products/product-tags.component';
import { TagEditComponent } from './products/tag-edit.component';
import { TagDetailComponent } from './products/tag-detail.component';

const routes: Routes = [
  {
    path: '', 
    component: DashboardComponent,
    canActivate: [PermissionGuard]
  },
  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent,
    canActivate: [PermissionGuard],
    data: { userTypes: ['ADMIN', 'SUPER_ADMIN'] }
  },
  {
    path: 'workspace-admin-dashboard',
    component: WorkspaceAdminDashboardComponent,
    canActivate: [PermissionGuard],
    data: { userTypes: ['WORKSPACE_ADMIN'] }
  },
  {
    path: 'shop-manager-dashboard',
    component: ShopManagerDashboardComponent,
    canActivate: [PermissionGuard],
    data: { userTypes: ['SHOP_MANAGER'] }
  },
  {
    path: 'technician-dashboard',
    component: TechnicianDashboardComponent,
    canActivate: [PermissionGuard],
    data: { userTypes: ['TECHNICIAN'] }
  },
  {
    path: 'deliverer-dashboard',
    component: DelivererDashboardComponent,
    canActivate: [PermissionGuard],
    data: { userTypes: ['DELIVERER'] }
  },
  {
    path: 'customers',
    component: CustomersComponent,
    canActivate: [PermissionGuard, LoadCustomerGuard],
    data: { permissions: ['customers:read'] }
  },
  // Marques produits
  {
    path: 'product-brands',
    component: ProductBrandsComponent,
    canActivate: [PermissionGuard],
    data: { permissions: ['products:read'] }
  },
  {
    path: 'product-brands/create',
    component: BrandEditComponent,
    canActivate: [PermissionGuard],
    data: { permissions: ['products:update'] }
  },
  {
    path: 'product-brands/detail/:id',
    component: BrandDetailComponent,
    canActivate: [PermissionGuard],
    data: { permissions: ['products:read'] }
  },
  {
    path: 'product-brands/edit/:id',
    component: BrandEditComponent,
    canActivate: [PermissionGuard],
    data: { permissions: ['products:update'] }
  },
  // Catégories produits
  {
    path: 'product-categories',
    component: ProductCategoriesComponent,
    canActivate: [PermissionGuard],
    data: { permissions: ['products:read'] }
  },
  {
    path: 'product-categories/create',
    component: CategoryEditComponent,
    canActivate: [PermissionGuard],
    data: { permissions: ['products:update'] }
  },
  {
    path: 'product-categories/detail/:id',
    component: CategoryDetailComponent,
    canActivate: [PermissionGuard],
    data: { permissions: ['products:read'] }
  },
  {
    path: 'product-categories/edit/:id',
    component: CategoryEditComponent,
    canActivate: [PermissionGuard],
    data: { permissions: ['products:update'] }
  },
  // Types de produits
  {
    path: 'product-types',
    component: ProductTypesComponent,
    canActivate: [PermissionGuard],
    data: { permissions: ['products:read'] }
  },
  {
    path: 'product-types/create',
    component: ProductTypeEditComponent,
    canActivate: [PermissionGuard],
    data: { permissions: ['products:update'] }
  },
  {
    path: 'product-types/detail/:id',
    component: ProductTypeDetailComponent,
    canActivate: [PermissionGuard],
    data: { permissions: ['products:read'] }
  },
  {
    path: 'product-types/edit/:id',
    component: ProductTypeEditComponent,
    canActivate: [PermissionGuard],
    data: { permissions: ['products:update'] }
  },
  // Tags
  {
    path: 'product-tags',
    component: ProductTagsComponent,
    canActivate: [PermissionGuard],
    data: { permissions: ['products:read'] }
  },
  {
    path: 'product-tags/create',
    component: TagEditComponent,
    canActivate: [PermissionGuard],
    data: { permissions: ['products:update'] }
  },
  {
    path: 'product-tags/detail/:id',
    component: TagDetailComponent,
    canActivate: [PermissionGuard],
    data: { permissions: ['products:read'] }
  },
  {
    path: 'product-tags/edit/:id',
    component: TagEditComponent,
    canActivate: [PermissionGuard],
    data: { permissions: ['products:update'] }
  },
  // Produits (liste)
  {
    path: 'products',
    component: AdminProductsComponent,
    canActivate: [PermissionGuard],
    data: { permissions: ['products:read'] }
  },
  // Produit - création
  {
    path: 'products/create',
    component: ProductEditComponent,
    canActivate: [PermissionGuard],
    data: { permissions: ['products:create'] }
  },
  // Produit - détail
  {
    path: 'products/detail/:id',
    component: ProductDetailComponent,
    canActivate: [PermissionGuard],
    data: { permissions: ['products:read'] }
  },
  // Produit - édition
  {
    path: 'products/edit/:id',
    component: ProductEditComponent,
    canActivate: [PermissionGuard],
    data: { permissions: ['products:update'] }
  },
  // Variants
  {
    path: 'product-variants',
    component: ProductVariantsComponent,
    canActivate: [PermissionGuard],
    data: { permissions: ['products:read'] }
  },
  // Stock & inventaire
  {
    path: 'product-stock',
    component: ProductStockComponent,
    canActivate: [PermissionGuard],
    data: { permissions: ['products:update'] }
  },
  // Promotions
  {
    path: 'product-promotions',
    component: ProductPromotionsComponent,
    canActivate: [PermissionGuard],
    data: { permissions: ['products:update'] }
  },
  // Analytics
  {
    path: 'product-analytics',
    component: ProductAnalyticsComponent,
    canActivate: [PermissionGuard],
    data: { permissions: ['products:read'] }
  },
  {
    path: 'autorisation',
    loadChildren: ()=> import('./autority/autority.module').then(m => m.AutorityModule)
  },
  {
    path: 'devis',
    children: [
      {
        path: 'demande',
        component: DemandeComponent,
        canActivate: [PermissionGuard, LoadDemandeGuard]
      }
    ]
  },
  {
    path: 'users',
    component: UsersManagementComponent,
    canActivate: [PermissionGuard],
    data: { permissions: ['users:manage'] }
  },
  {
    path: 'admins',
    children: [
      {
        path: '',
        component: AdminsComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['admins:read'] }
      },
      {
        path: 'detail/:id',
        component: AdminDetailComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['admins:read'] }
      },
      {
        path: 'edit/:id',
        component: AdminEditComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['admins:update'] }
      }
    ]
  },
  {
    path: 'workspace-admins',
    children: [
      {
        path: '',
        component: WorkspacesComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['workspaces:read'] }
      },
      {
        path: 'detail/:id',
        component: AdminDetailComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['workspaces:read'] }
      },
      {
        path: 'edit/:id',
        component: AdminEditComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['workspaces:update'] }
      }
    ]
  },
  {
    path: 'workspaces',
    children: [
      {
        path: '',
        component: WorkspacesComponent, // TODO: Créer un nouveau composant pour afficher les workspaces (espaces) et non les workspace admins
        canActivate: [PermissionGuard],
        data: { permissions: ['workspaces:read'] }
      }
    ]
  },
  {
    path: 'shop-managers',
    children: [
      {
        path: '',
        component: EmployeesComponent, // TODO: Créer un nouveau composant pour afficher uniquement les shop managers
        canActivate: [PermissionGuard],
        data: { permissions: ['employees:read'] }
      }
    ]
  },
  {
    path: 'shops',
    children: [
      {
        path: '',
        component: ShopsComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['shops:read'] }
      },
      {
        path: 'detail/:id',
        component: ShopDetailComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['shops:read'] }
      },
      {
        path: 'edit/:id',
        component: ShopEditComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['shops:update'] }
      }
    ]
  },
  {
    path: 'employees',
    children: [
      {
        path: '',
        component: EmployeesComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['employees:read'] }
      },
      {
        path: 'detail/:id',
        component: EmployeeDetailComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['employees:read'] }
      },
      {
        path: 'edit/:id',
        component: EmployeeEditComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['employees:update'] }
      }
    ]
  },
  {
    path: 'invitations',
    children: [
      {
        path: '',
        component: InvitationsComponent,
        canActivate: [PermissionGuard],
        // SUPER_ADMIN et ADMIN doivent avoir le même accès
        data: { roles: ['SUPERADMIN', 'ADMIN', 'SUPER_ADMIN'] }
      },
      {
        path: 'detail/:id',
        component: InvitationDetailComponent,
        canActivate: [PermissionGuard],
        // SUPER_ADMIN et ADMIN doivent avoir le même accès
        data: { roles: ['SUPERADMIN', 'ADMIN', 'SUPER_ADMIN'] }
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
