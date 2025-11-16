import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AutorityRoutingModule } from './autority-routing.module';
import { AutorisationComponent } from './autorisation/autorisation.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModuleModule } from 'src/app/shared-module/shared-module.module';
import { RoleComponent } from './role/role.component';
import { CreateRoleComponent } from './create-role/create-role.component';
import { RoleDetailComponent } from './role-detail/role-detail.component';
import { PermissionDetailComponent } from './permission-detail/permission-detail.component';


@NgModule({
  declarations: [
    AutorisationComponent,
    RoleComponent,
    CreateRoleComponent,
    RoleDetailComponent,
    PermissionDetailComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    AutorityRoutingModule,
    TranslateModule,
    SharedModuleModule,
  ]
})
export class AutorityModule { }
