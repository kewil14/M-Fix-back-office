import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { LangInterceptor } from './shared/interceptors/lang.interceptor';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { APP_ENUMS } from './config/app.enums.config';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { reducers } from './core.state';
import { AuthenticationEffects } from './shared/stores/authentification/authentification.effects';
import { ProfileEffects } from './shared/stores/profile/profile.effects';
import { SystemInitEffects } from './shared/stores/system-init/system-init.effects';
import { ErrorInterceptor } from './shared/interceptors/error.interceptor';
import { JwtInterceptor } from './shared/interceptors/jwt.interceptor';
import { RolesEffects } from './shared/stores/role/role.effects';
import { UserEffects } from './shared/stores/user/user.effects';
import { GrilleEffects } from './shared/stores/grille/grille.effects';
import { AvisEffects } from './shared/stores/avis/avis.effects';
import { DevisEffects } from './shared/stores/devis/devis.effects';
import { DemandeEffects } from './shared/stores/demande/demande.effects';
import { EmployeeEffects } from './shared/stores/employee/employee.effects';
import { AdminEffects } from './shared/stores/admin/admin.effects';
import { WorkspaceAdminEffects } from './shared/stores/workspace-admin/workspace-admin.effects';


export function createTranslateLoader(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    TranslateModule.forRoot({
      defaultLanguage: APP_ENUMS.PREFIX_DEFAULT_LANGUAGE,
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    StoreModule.forRoot(reducers, {}),
    EffectsModule.forRoot([
      AuthenticationEffects, ProfileEffects, 
      SystemInitEffects, RolesEffects, UserEffects, 
      GrilleEffects, AvisEffects, DevisEffects,
      DemandeEffects, EmployeeEffects, AdminEffects, WorkspaceAdminEffects,
    ]),
    StoreDevtoolsModule.instrument(),
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: LangInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    // ErrorInterceptor doit être le dernier pour intercepter toutes les erreurs
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    HttpClient
  ],
})
export class CoreModule { }
