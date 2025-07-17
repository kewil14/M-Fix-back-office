import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UIModule } from './ui/ui.module';

import { WidgetModule } from './widget/widget.module';
import { SharedModuleModule } from '../shared-module/shared-module.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    UIModule,
    WidgetModule,
    SharedModuleModule,
  ],
})

export class SharedModule { }
