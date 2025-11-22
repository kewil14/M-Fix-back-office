import { Component, OnInit } from '@angular/core';
import { DashboardComponent } from '../dashboard.component';

@Component({
  selector: 'app-shop-manager-dashboard',
  templateUrl: '../dashboard.component.html',
  styleUrls: ['../dashboard.component.scss']
})
export class ShopManagerDashboardComponent extends DashboardComponent implements OnInit {
  userType = 'SHOP_MANAGER';
}

