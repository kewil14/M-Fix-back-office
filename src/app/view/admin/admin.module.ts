import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CustomersComponent } from './customers/customers.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { GrilleComponent } from './grille/grille.component';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { SimplebarAngularModule } from 'simplebar-angular';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgApexchartsModule } from 'ng-apexcharts';
import { WidgetModule } from 'src/app/shared/widget/widget.module';
import { SharedModuleModule } from 'src/app/shared-module/shared-module.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [
    DashboardComponent,
    CustomersComponent,
    GrilleComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,

    PaginationModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),

    UIModule,
    BsDropdownModule.forRoot(),
    TooltipModule.forRoot(),
    TabsModule.forRoot(),
    CarouselModule.forRoot(),
    WidgetModule,
    NgApexchartsModule,
    SharedModule,
    SimplebarAngularModule,
    NgSelectModule,

    TranslateModule,
    
    SharedModuleModule,
    
  ],
  providers: [
    DecimalPipe,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class AdminModule { }
