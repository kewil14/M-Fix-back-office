import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './view/authentification/login/login.component';
import { RegisterComponent } from './view/authentification/register/register.component';
import { LayoutAdminComponent } from './layout-admin/layout-admin.component';

const routes: Routes = [
  
  {path: '', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {
    path: 'admin', 
    component: LayoutAdminComponent,
    loadChildren: () => import('./view/admin/admin.module').then(m => m.AdminModule)
  },
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})

export class AppRoutingModule { }
