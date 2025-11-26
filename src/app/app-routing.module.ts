import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './view/authentification/login/login.component';
import { RegisterComponent } from './view/authentification/register/register.component';
import { ActivateAccountComponent } from './view/authentification/activate-account/activate-account.component';
import { NewPasswordComponent } from './view/authentification/new-password/new-password.component';
import { ForgotPasswordComponent } from './view/authentification/forgot-password/forgot-password.component';
import { LayoutAdminComponent } from './layout-admin/layout-admin.component';
import { LoggedInGuard } from './core/shared/guards/logged-in.guard';

const routes: Routes = [
  
  {path: '', component: LoginComponent, canActivate: [LoggedInGuard]},
  {path: 'register', component: RegisterComponent, canActivate: [LoggedInGuard]},
  {path: 'activate-account', component: ActivateAccountComponent},
  {path: 'auth/activate', component: ActivateAccountComponent},
  {path: 'auth/new-password', component: NewPasswordComponent},
  {path: 'auth/forgot-password', component: ForgotPasswordComponent},
  {
    path: 'admin', 
    component: LayoutAdminComponent,
    loadChildren: () => import('./view/admin/admin.module').then(m => m.AdminModule)
  },
  // Routes pour les pages (contacts, etc.)
  {
    path: 'pages',
    loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule)
  },
  // Route pour le lock screen
  {
    path: 'auth',
    loadChildren: () => import('./extrapages/extrapages.module').then(m => m.ExtrapagesModule)
  },
  // Routes directes pour les pages d'erreur
  {
    path: '403',
    loadChildren: () => import('./extrapages/extrapages.module').then(m => m.ExtrapagesModule)
  },
  {
    path: '404',
    loadChildren: () => import('./extrapages/extrapages.module').then(m => m.ExtrapagesModule)
  },
  {
    path: '500',
    loadChildren: () => import('./extrapages/extrapages.module').then(m => m.ExtrapagesModule)
  },
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})

export class AppRoutingModule { }
