import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './components/footer/footer.component';
import { EstimateDevisComponent } from './forms/devis/estimate-devis/estimate-devis.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageAlertComponent } from './components/messages/message-alert/message-alert.component';
import { Loading5Component } from './components/loading5/loading5.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormRegisterComponent } from './forms/users/form-register/form-register.component';
import { MaintenanceComponent } from './components/maintenance/maintenance.component';
import { FooterSharedComponent } from './components/footer-shared/footer-shared.component';
import { HeaderSharedComponent } from './components/header-shared/header-shared.component';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { UpdateAuthorityComponent } from './forms/autorities/update-authority/update-authority.component';
import { AddRoleComponent } from './forms/autorities/add-role/add-role.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { ManageAuthorityComponent } from './forms/autorities/manage-authority/manage-authority.component';
import { DeleteConfirmModalComponent } from './components/delete-confirm-modal/delete-confirm-modal.component';
import { DuplicateProductModalComponent } from './components/duplicate-product-modal/duplicate-product-modal.component';
import { ModalModule } from 'ngx-bootstrap/modal';

@NgModule({
  declarations: [
    FooterComponent,
    EstimateDevisComponent,
    MessageAlertComponent,
    Loading5Component,
    FormRegisterComponent,
    HeaderSharedComponent,
    FooterSharedComponent,
    MaintenanceComponent,
    UpdateAuthorityComponent,
    AddRoleComponent,
    ManageAuthorityComponent,
    DeleteConfirmModalComponent,
    DuplicateProductModalComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // NgbAlertModule,
    TranslateModule,
    NgSelectModule,
    ScrollToModule.forRoot(),
    ModalModule.forRoot(),
  ],
  exports: [
    FooterComponent,
    EstimateDevisComponent,
    MessageAlertComponent,
    Loading5Component,
    FormRegisterComponent,
    HeaderSharedComponent,
    FooterSharedComponent,
    MaintenanceComponent,
    UpdateAuthorityComponent,
    AddRoleComponent,
    ManageAuthorityComponent,
    DeleteConfirmModalComponent,
    DuplicateProductModalComponent,
  ]
})
export class SharedModuleModule { }
