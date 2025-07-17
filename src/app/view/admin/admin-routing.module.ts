import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CustomersComponent } from './customers/customers.component';
import { GrilleComponent } from './grille/grille.component';
import { LoadCustomerGuard } from 'src/app/core/shared/guards/load-customers.guard';
import { LoadGrilleGuard } from 'src/app/core/shared/guards/load-grille.guard';

const routes: Routes = [
  {path: '', component: DashboardComponent},
  {
    path: 'avis',
    loadChildren: ()=> import('./avis/avis.module').then(m => m.AvisModule)
  },
  {
    path: 'devis',
    loadChildren: ()=> import('./devis/devis.module').then(m => m.DevisModule)
  },
  {
    path: 'customers',
    component: CustomersComponent,
    canActivate: [LoadCustomerGuard]
  },
  {
    path: 'grille',
    component: GrilleComponent,
    canActivate: [LoadGrilleGuard],
  },
  {
    path: 'autorisation',
    loadChildren: ()=> import('./autority/autority.module').then(m => m.AutorityModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
