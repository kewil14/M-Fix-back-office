import { Component, OnInit } from '@angular/core';
import { DashboardComponent } from '../dashboard.component';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: '../dashboard.component.html',
  styleUrls: ['../dashboard.component.scss']
})
export class AdminDashboardComponent extends DashboardComponent implements OnInit {
  userType = 'ADMIN';
}

