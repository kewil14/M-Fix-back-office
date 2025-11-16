import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { AccordionModule } from 'ngx-bootstrap/accordion';

import { CarouselModule } from 'ngx-owl-carousel-o';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';


import { SharedModule } from './cyptolanding/shared/shared.module';

// import { ExtrapagesModule } from './extrapages/extrapages.module';

import { LayoutsModule } from './layouts/layouts.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
// import { CyptolandingComponent } from './cyptolanding/cyptolanding.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { ToastrModule } from 'ngx-toastr';
// import { HomeComponent } from './view/home/home/home.component';
import { LoginComponent } from './view/authentification/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertModule } from 'ngx-bootstrap/alert';
import { UIModule } from './shared/ui/ui.module';
import { LayoutAdminModule } from './layout-admin/layout-admin.module';
import { SharedModuleModule } from './shared-module/shared-module.module';
import { RatingModule } from 'ngx-bootstrap/rating';
import { CoreModule } from './core/core.module';
import { RegisterComponent } from './view/authentification/register/register.component';
import { AdminRegisterComponent } from './view/authentification/admin-register/admin-register.component';
import { ActivateAccountComponent } from './view/authentification/activate-account/activate-account.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
// import { DemandeDevisComponent } from './view/demande-devis/demande-devis.component';
// import { ContacterNousComponent } from './view/contacter-nous/contacter-nous.component';
// import { CgvComponent } from './view/cgv/cgv.component';
// import { ProtectionDonneesComponent } from './view/protection-donnees/protection-donnees.component';
// import { MentionLegaleComponent } from './view/mention-legale/mention-legale.component';
import { ArchwizardModule } from 'angular-archwizard';
import { ModalModule } from 'ngx-bootstrap/modal';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
// import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';

// if (environment.defaultauth === 'firebase') {
//   initFirebaseBackend(environment.firebaseConfig);
// } else {
//   // tslint:disable-next-line: no-unused-expression
//   FakeBackendInterceptor;
// }

export function createTranslateLoader(http: HttpClient): any {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    // CyptolandingComponent,
    // HomeComponent,
    LoginComponent,
    RegisterComponent,
    AdminRegisterComponent,
    ActivateAccountComponent,
    // DemandeDevisComponent,
    // ContacterNousComponent,

    // CgvComponent,
    // ProtectionDonneesComponent,
    // MentionLegaleComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    MatInputModule,
    MatAutocompleteModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),
    AppRoutingModule,
    // ExtrapagesModule,
    CarouselModule,
    AccordionModule.forRoot(),
    TabsModule.forRoot(),
    TooltipModule.forRoot(),
    SharedModule,
    ScrollToModule.forRoot(),
    ToastrModule.forRoot(),
    ArchwizardModule,

    ReactiveFormsModule,
    FormsModule,
    AlertModule.forRoot(),
    UIModule,

    LayoutAdminModule,

    CoreModule,

    ModalModule.forRoot(),

    // MatAutocompleteModule,
    // MatInputModule,

    // les modules a retirer lorsque je ferai la proprete du code
    LayoutsModule,
    SharedModuleModule,
    RatingModule.forRoot(),

    BsDropdownModule.forRoot(),
    // RecaptchaModule,      
    // RecaptchaFormsModule

  ],
  bootstrap: [AppComponent],
  providers: [
    
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class AppModule { }
