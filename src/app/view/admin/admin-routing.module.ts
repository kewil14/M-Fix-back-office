import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
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

const routes: Routes = [
  {
    path: '', 
    component: DashboardComponent,
    canActivate: [PermissionGuard]
  },
  {
    path: 'customers',
    component: CustomersComponent,
    canActivate: [PermissionGuard, LoadCustomerGuard],
    data: { permissions: ['customers:read'] }
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
    path: 'workspaces',
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
        data: { roles: ['SUPERADMIN'] }
      },
      {
        path: 'detail/:id',
        component: InvitationDetailComponent,
        canActivate: [PermissionGuard],
        data: { roles: ['SUPERADMIN'] }
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
