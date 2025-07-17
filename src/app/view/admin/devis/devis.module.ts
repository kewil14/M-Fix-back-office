import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

import { DevisRoutingModule } from './devis-routing.module';
import { DevisComponentComponent } from './devis-component/devis-component.component';
import { DemandeComponentComponent } from './demande-component/demande-component.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { AdvancedService } from 'src/app/pages/tables/advancedtable/advanced.service';
import { SharedModuleModule } from 'src/app/shared-module/shared-module.module';


@NgModule({
  declarations: [
    DevisComponentComponent,
    DemandeComponentComponent,
  ],
  imports: [
    CommonModule,
    DevisRoutingModule,
    FormsModule,
    ReactiveFormsModule,

    UIModule,
    PaginationModule.forRoot(),
    TypeaheadModule.forRoot(),
    BsDropdownModule.forRoot(),
    FormsModule,
    Ng2SmartTableModule,
    SharedModuleModule,
  ],
  providers: [AdvancedService, DecimalPipe]
})
export class DevisModule { }
