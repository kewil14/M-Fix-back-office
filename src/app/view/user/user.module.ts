import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import { UserComponent } from './user/user.component';
import { HistoriqueComponent } from './historique/historique.component';
import { SharedModuleModule } from 'src/app/shared-module/shared-module.module';


@NgModule({
  declarations: [
    UserComponent,
    HistoriqueComponent
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    SharedModuleModule,
  ]
})
export class UserModule { }
