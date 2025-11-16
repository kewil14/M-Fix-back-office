import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './view/authentification/login/login.component';
import { RegisterComponent } from './view/authentification/register/register.component';
import { ActivateAccountComponent } from './view/authentification/activate-account/activate-account.component';
import { LayoutAdminComponent } from './layout-admin/layout-admin.component';
import { LoggedInGuard } from './core/shared/guards/logged-in.guard';

const routes: Routes = [
  
  {path: '', component: LoginComponent, canActivate: [LoggedInGuard]},
  {path: 'register', component: RegisterComponent, canActivate: [LoggedInGuard]},
  {path: 'activate-account', component: ActivateAccountComponent},
  {
    path: 'admin', 
    component: LayoutAdminComponent,
    loadChildren: () => import('./view/admin/admin.module').then(m => m.AdminModule)
  },
  // Routes pour les pages d'erreur (accessibles depuis n'importe où)
  {
    path: 'pages',
    loadChildren: () => import('./pages/utility/utility.module').then(m => m.UtilityModule)
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
