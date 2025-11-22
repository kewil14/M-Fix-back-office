import { Component, OnInit } from '@angular/core';
import { DashboardComponent } from '../dashboard.component';

@Component({
  selector: 'app-technician-dashboard',
  templateUrl: '../dashboard.component.html',
  styleUrls: ['../dashboard.component.scss']
})
export class TechnicianDashboardComponent extends DashboardComponent implements OnInit {
  userType = 'TECHNICIAN';
}

