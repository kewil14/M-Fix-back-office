import { Component, OnInit } from '@angular/core';
import { DashboardComponent } from '../dashboard.component';

@Component({
  selector: 'app-workspace-admin-dashboard',
  templateUrl: '../dashboard.component.html',
  styleUrls: ['../dashboard.component.scss']
})
export class WorkspaceAdminDashboardComponent extends DashboardComponent implements OnInit {
  userType = 'WORKSPACE_ADMIN';
}

