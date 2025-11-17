import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Observable, Subscription } from 'rxjs';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { selectAdminState, selectWorkspaceAdminState } from 'src/app/core/core.state';
import { EmployeeResponseDto } from 'src/app/core/shared/dtos/employee-response-dto';
import { findAdminById } from 'src/app/core/shared/stores/admin/admin.actions';
import { AdminState } from 'src/app/core/shared/stores/admin/admin.state';
import { findWorkspaceAdminById } from 'src/app/core/shared/stores/workspace-admin/workspace-admin.actions';
import { WorkspaceAdminState } from 'src/app/core/shared/stores/workspace-admin/workspace-admin.state';
import { resendInvitation, resendInvitationOk, resendInvitationError } from 'src/app/core/shared/stores/authentification/authentification.actions';
import { ResendInvitationDto } from 'src/app/core/shared/dtos/resend-invitation-dto.modal';

@Component({
  selector: 'app-admin-detail',
  templateUrl: './admin-detail.component.html',
  styleUrls: ['./admin-detail.component.scss']
})
export class AdminDetailComponent implements OnInit, OnDestroy {
  adminState$!: Observable<AdminState>;
  workspaceAdminState$!: Observable<WorkspaceAdminState>;
  admin: EmployeeResponseDto | null = null;
  adminId: string | null = null;
  subscriptions: Subscription[] = [];
  dataStateEnum: typeof DataStateEnum = DataStateEnum;
  breadCrumbItems: Array<{}> = [];
  isWorkspaceAdmin: boolean = false;

  isResendingInvitation = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storeService: Store,
    private actionService: Actions
  ) {}

  ngOnInit(): void {
    const url = this.router.url;
    this.isWorkspaceAdmin = url.includes('/workspaces/');
    
    if (this.isWorkspaceAdmin) {
      this.breadCrumbItems = [
        { label: 'Admin' },
        { label: 'Workspaces', routerLink: '/admin/workspaces' },
        { label: 'Détail', active: true }
      ];
      this.workspaceAdminState$ = this.storeService.select(selectWorkspaceAdminState).pipe();
      
      this.subscriptions.push(
        this.workspaceAdminState$.subscribe(state => {
          if (state.dataState === DataStateEnum.SUCCESS && state.workspaceAdmin) {
            if (!this.adminId || state.workspaceAdmin.id === this.adminId) {
              this.admin = state.workspaceAdmin;
            }
          }
        })
      );
    } else {
      this.breadCrumbItems = [
        { label: 'Admin' },
        { label: 'Administrateurs', routerLink: '/admin/admins' },
        { label: 'Détail', active: true }
      ];
      this.adminState$ = this.storeService.select(selectAdminState).pipe();
      
      this.subscriptions.push(
        this.adminState$.subscribe(state => {
          if (state.dataState === DataStateEnum.SUCCESS && state.admin) {
            if (!this.adminId || state.admin.id === this.adminId) {
              this.admin = state.admin;
            }
          }
        })
      );
    }
    
    this.route.paramMap.subscribe(params => {
      this.adminId = params.get('id');
      if (this.adminId) {
        this.loadAdmin();
      }
    });

    // Écouter les actions de renvoi d'invitation
    this.subscriptions.push(
      this.actionService.pipe(ofType(resendInvitationOk)).subscribe(() => {
        this.isResendingInvitation = false;
      }),
      this.actionService.pipe(ofType(resendInvitationError)).subscribe(() => {
        this.isResendingInvitation = false;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadAdmin(): void {
    if (this.adminId) {
      if (this.isWorkspaceAdmin) {
        this.storeService.dispatch(findWorkspaceAdminById({ workspaceAdminId: this.adminId }));
      } else {
        this.storeService.dispatch(findAdminById({ adminId: this.adminId }));
      }
    }
  }

  onEdit(): void {
    if (this.adminId) {
      if (this.isWorkspaceAdmin) {
        this.router.navigate(['/admin/workspaces/edit', this.adminId]);
      } else {
        this.router.navigate(['/admin/admins/edit', this.adminId]);
      }
    }
  }

  onBack(): void {
    if (this.isWorkspaceAdmin) {
      this.router.navigate(['/admin/workspaces']);
    } else {
      this.router.navigate(['/admin/admins']);
    }
  }

  onResendInvitation(): void {
    if (!this.admin?.email || this.isResendingInvitation) {
      return;
    }

    this.isResendingInvitation = true;
    const resendInvitationDto: ResendInvitationDto = {
      email: this.admin.email
    };

    this.storeService.dispatch(resendInvitation({ resendInvitationDto }));
  }
}

