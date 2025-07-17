import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SimplebarAngularModule } from 'simplebar-angular';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import { UIModule } from '../shared/ui/ui.module';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopbarComponent } from './topbar/topbar.component';
import { FooterComponent } from './footer/footer.component';
import { RightsidebarComponent } from './rightsidebar/rightsidebar.component';
import { HorizontalComponent } from './horizontal/horizontal.component';
import { VerticalComponent } from './vertical/vertical.component';
import { HorizontaltopbarComponent } from './horizontaltopbar/horizontaltopbar.component';
import { LanguageService } from '../core/services/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { LayoutAdminComponent } from './layout-admin.component';
import { SharedModuleModule } from '../shared-module/shared-module.module';

@NgModule({
  // tslint:disable-next-line: max-line-length
  declarations: [LayoutAdminComponent, 
    SidebarComponent, TopbarComponent, FooterComponent, RightsidebarComponent, HorizontalComponent, VerticalComponent, HorizontaltopbarComponent],
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    BsDropdownModule.forRoot(),
    UIModule,
    SimplebarAngularModule,

    SharedModuleModule,
  ],
  providers: [LanguageService]
})
export class LayoutAdminModule { }
