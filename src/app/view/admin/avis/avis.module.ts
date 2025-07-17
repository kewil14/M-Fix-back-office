import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

import { AvisRoutingModule } from './avis-routing.module';
import { AvisComponentComponent } from './avis-component/avis-component.component';
import { CustomersService } from 'src/app/pages/ecommerce/customers/customers.service';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModuleModule } from 'src/app/shared-module/shared-module.module';
// import { BsDropdownModule } from 'ngx-bootstrap/dropdown';


@NgModule({
  declarations: [
    AvisComponentComponent,
  ],
  imports: [
    CommonModule,
    AvisRoutingModule,
    PaginationModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    SharedModuleModule,

    // BsDropdownModule.forRoot(),
    
  ],
  providers: [CustomersService, DecimalPipe]
  
})
export class AvisModule { }
