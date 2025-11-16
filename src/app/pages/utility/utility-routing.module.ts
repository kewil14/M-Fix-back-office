import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StarterComponent } from './starter/starter.component';
import { TimelineComponent } from './timeline/timeline.component';
import { PricingComponent } from './pricing/pricing.component';
import { FaqsComponent } from './faqs/faqs.component';

const routes: Routes = [
    {
        path: 'starter',
        component: StarterComponent
    },
    {
        path: 'timeline',
        component: TimelineComponent
    },
    {
        path: 'pricing',
        component: PricingComponent
    },
    {
        path: 'faqs',
        component: FaqsComponent
    },
    {
        path: '404',
        loadChildren: () => import('../../extrapages/extrapages.module').then(m => m.ExtrapagesModule)
    },
    {
        path: '403',
        loadChildren: () => import('../../extrapages/extrapages.module').then(m => m.ExtrapagesModule)
    },
    {
        path: '500',
        loadChildren: () => import('../../extrapages/extrapages.module').then(m => m.ExtrapagesModule)
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UtiliytRoutingModule { }
