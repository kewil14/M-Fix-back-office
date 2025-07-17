import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UIModule } from '../../shared/ui/ui.module';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PaginationModule } from 'ngx-bootstrap/pagination';


import { Ng2SmartTableModule } from 'ng2-smart-table';

import { TablesRoutingModule } from './tables-routing.module';
import { AdvancedSortableDirective } from './advancedtable/advanced-sortable.directive';
import { BasicComponent } from './basic/basic.component';
import { AdvancedtableComponent } from './advancedtable/advancedtable.component';
import { EditableComponent } from './editable/editable.component';

@NgModule({
  declarations: [BasicComponent, AdvancedtableComponent, AdvancedSortableDirective, EditableComponent],
  imports: [
    CommonModule,
    TablesRoutingModule,
    UIModule,
    PaginationModule.forRoot(),
    TypeaheadModule.forRoot(),
    BsDropdownModule.forRoot(),
    FormsModule,
    Ng2SmartTableModule
  ]
})
export class TablesModule { }
