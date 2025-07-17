import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AutorisationComponent } from './autorisation/autorisation.component';
import { LoadAuthorityGuard } from 'src/app/core/guards/load-authority.guard';
import { RoleComponent } from './role/role.component';
import { LoadRolesGuard } from 'src/app/core/guards/load-roles.guards';
import { CreateRoleComponent } from './create-role/create-role.component';
import { CheckRoleGuard } from 'src/app/core/guards/check-role.guard';

const routes: Routes = [
  {
    path: '',
    component: AutorisationComponent,
    canActivate: [LoadAuthorityGuard]
  },
  {
    path: 'role',
    component: RoleComponent,
    canActivate: [LoadRolesGuard]
  },
  {
    path:"role/create/:idRole", component: CreateRoleComponent,
    canActivate:[LoadAuthorityGuard, CheckRoleGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AutorityRoutingModule { }
