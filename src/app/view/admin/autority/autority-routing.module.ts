import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AutorisationComponent } from './autorisation/autorisation.component';
import { LoadAuthorityGuard } from 'src/app/core/guards/load-authority.guard';
import { RoleComponent } from './role/role.component';
import { LoadRolesGuard } from 'src/app/core/guards/load-roles.guards';
import { CreateRoleComponent } from './create-role/create-role.component';
import { CheckRoleGuard } from 'src/app/core/guards/check-role.guard';
import { PermissionGuard } from 'src/app/core/shared/guards/permission.guard';
import { RoleDetailComponent } from './role-detail/role-detail.component';
import { PermissionDetailComponent } from './permission-detail/permission-detail.component';

const routes: Routes = [
  {
    path: '',
    component: AutorisationComponent,
    canActivate: [PermissionGuard, LoadAuthorityGuard],
    data: { permissions: ['roles:read'] }
  },
  {
    path: 'role',
    component: RoleComponent,
    canActivate: [PermissionGuard, LoadRolesGuard],
    data: { permissions: ['roles:read'] }
  },
  {
    path:"role/create/:idRole", 
    component: CreateRoleComponent,
    canActivate: [PermissionGuard, LoadAuthorityGuard, CheckRoleGuard],
    data: { permissions: ['roles:create'] }
  },
  {
    path: 'role/detail/:id',
    component: RoleDetailComponent,
    canActivate: [PermissionGuard],
    data: { permissions: ['roles:read'] }
  },
  {
    path: 'permission/detail/:id',
    component: PermissionDetailComponent,
    canActivate: [PermissionGuard],
    data: { permissions: ['roles:read'] }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AutorityRoutingModule { }
