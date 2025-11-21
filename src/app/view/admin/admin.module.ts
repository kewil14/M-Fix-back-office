import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CustomersComponent } from './customers/customers.component';
import { DemandeComponent } from './devis/demande/demande.component';
import { CreateAdminComponent } from './users/create-admin/create-admin.component';
import { CreateWorkspaceAdminComponent } from './users/create-workspace-admin/create-workspace-admin.component';
import { CreateEmployeeComponent } from './users/create-employee/create-employee.component';
import { CreateUserComponent } from './users/create-user/create-user.component';
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
import { CreateShopComponent } from './shops/create-shop/create-shop.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
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
    DemandeComponent,
    CreateAdminComponent,
    CreateWorkspaceAdminComponent,
    CreateEmployeeComponent,
    CreateUserComponent,
    UsersManagementComponent,
    AdminsComponent,
    WorkspacesComponent,
    EmployeesComponent,
    EmployeeDetailComponent,
    EmployeeEditComponent,
    AdminDetailComponent,
    AdminEditComponent,
    InvitationsComponent,
    InvitationDetailComponent,
    ShopsComponent,
    ShopDetailComponent,
    ShopEditComponent,
    CreateShopComponent,
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

    TranslateModule.forChild(),
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
