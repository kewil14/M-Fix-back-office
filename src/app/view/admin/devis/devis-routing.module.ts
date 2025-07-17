import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DevisComponentComponent } from './devis-component/devis-component.component';
import { DemandeComponentComponent } from './demande-component/demande-component.component';
import { LoadDemandeGuard } from 'src/app/core/shared/guards/load-demande.guard';
import { LoadDevisGuard } from 'src/app/core/shared/guards/load-devis.guard';

const routes: Routes = [
  {
    path: '',
    component: DevisComponentComponent,
    canActivate: [LoadDevisGuard]
  },
  {
    path: 'demande',
    component: DemandeComponentComponent,
    canActivate: [LoadDemandeGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DevisRoutingModule { }
