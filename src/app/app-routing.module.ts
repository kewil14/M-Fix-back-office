import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './view/home/home/home.component';
import { LoginComponent } from './view/authentification/login/login.component';
import { LayoutAdminComponent } from './layout-admin/layout-admin.component';
import { CheckInitStateGuard } from './core/shared/guards/check-init.guard ';
import { RegisterComponent } from './view/authentification/register/register.component';
import { CheckAdminGuard } from './core/shared/guards/check-admin.guard';
import { DemandeDevisComponent } from './view/demande-devis/demande-devis.component';
import { ContacterNousComponent } from './view/contacter-nous/contacter-nous.component';
import { MentionLegaleComponent } from './view/mention-legale/mention-legale.component';
import { ProtectionDonneesComponent } from './view/protection-donnees/protection-donnees.component';
import { CgvComponent } from './view/cgv/cgv.component';

// import { CyptolandingComponent } from './cyptolanding/cyptolanding.component';
// import { LayoutComponent } from './layouts/layout.component';
// import { AuthGuard } from './core/guards/auth.guard';
// import { Page404Component } from './extrapages/page404/page404.component';

const routes: Routes = [
  // { path: 'account', loadChildren: () => import('./account/account.module').then(m => m.AccountModule) },
  // // tslint:disable-next-line: max-line-length
  // { path: '', component: LayoutComponent, loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule), canActivate: [AuthGuard] },
  // { path: 'pages', loadChildren: () => import('./extrapages/extrapages.module').then(m => m.ExtrapagesModule), canActivate: [AuthGuard] },
  // { path: 'pages', loadChildren: () => import('./extrapages/extrapages.module').then(m => m.ExtrapagesModule), canActivate: [] },
  // { path: 'crypto-ico-landing', component: CyptolandingComponent },
  // { path: '**', component: Page404Component },


  // {path: '', component: HomeComponent, canActivate: [CheckInitStateGuard]},
  {path: '', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {
    path: 'admin', 
    component: LayoutAdminComponent , 
    loadChildren: () => import('./view/admin/admin.module').then(m=> m.AdminModule),
    canActivate: [CheckAdminGuard]
  },
  {
    path: 'users',
    loadChildren: () => import('./view/user/user.module').then(m => m.UserModule),
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})

export class AppRoutingModule { }
