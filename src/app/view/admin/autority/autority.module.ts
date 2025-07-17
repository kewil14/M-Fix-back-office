import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AutorityRoutingModule } from './autority-routing.module';
import { AutorisationComponent } from './autorisation/autorisation.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModuleModule } from 'src/app/shared-module/shared-module.module';
import { RoleComponent } from './role/role.component';
import { CreateRoleComponent } from './create-role/create-role.component';


@NgModule({
  declarations: [
    AutorisationComponent,
    RoleComponent,
    CreateRoleComponent,
  ],
  imports: [
    CommonModule,
    AutorityRoutingModule,
    TranslateModule,
    SharedModuleModule,
    
    
  ]
})
export class AutorityModule { }
