import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { EcommerceRoutingModule } from './ecommerce-routing.module';
import { UIModule } from '../../shared/ui/ui.module';
import { WidgetModule } from '../../shared/widget/widget.module';

import { Ng5SliderModule } from 'ng5-slider';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { TabsModule } from 'ngx-bootstrap/tabs';

import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';

import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { DROPZONE_CONFIG } from 'ngx-dropzone-wrapper';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

import { ProductsComponent } from './products/products.component';
import { ProductdetailComponent } from './productdetail/productdetail.component';
import { ShopsComponent } from './shops/shops.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { CartComponent } from './cart/cart.component';
import { AddproductComponent } from './addproduct/addproduct.component';
import { CustomersComponent } from './customers/customers.component';
import { OrdersComponent } from './orders/orders.component';

const config: DropzoneConfigInterface = {
  // Change this to your upload POST address:
  url: 'https://httpbin.org/post',
  maxFilesize: 100,
};

@NgModule({
  // tslint:disable-next-line: max-line-length
  declarations: [ProductsComponent, ProductdetailComponent, ShopsComponent, CheckoutComponent, CartComponent, AddproductComponent, CustomersComponent, OrdersComponent],
  imports: [
    CommonModule,
    EcommerceRoutingModule,
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    FormsModule,
    Ng2SearchPipeModule,
    BsDropdownModule.forRoot(),
    DropzoneModule,
    ReactiveFormsModule,
    UIModule,
    WidgetModule,
    Ng5SliderModule,
    NgSelectModule,
    PaginationModule.forRoot(),
    BsDatepickerModule.forRoot()
  ],
  providers: [
    {
      provide: DROPZONE_CONFIG,
      useValue: config
    }
  ]
})
export class EcommerceModule { }
