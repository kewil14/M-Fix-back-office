import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AvisComponentComponent } from './avis-component/avis-component.component';
import { LoadAvisGuard } from 'src/app/core/shared/guards/load-avis.guard';

const routes: Routes = [
  {
    path: '',
    component: AvisComponentComponent,
    canActivate: [LoadAvisGuard],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AvisRoutingModule { }
