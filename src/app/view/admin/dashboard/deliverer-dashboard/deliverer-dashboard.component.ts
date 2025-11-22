import { Component, OnInit } from '@angular/core';
import { DashboardComponent } from '../dashboard.component';

@Component({
  selector: 'app-deliverer-dashboard',
  templateUrl: '../dashboard.component.html',
  styleUrls: ['../dashboard.component.scss']
})
export class DelivererDashboardComponent extends DashboardComponent implements OnInit {
  userType = 'DELIVERER';
}

