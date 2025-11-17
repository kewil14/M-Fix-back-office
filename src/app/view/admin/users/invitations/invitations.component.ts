import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { APP_COLORS, APP_ICONS } from 'src/app/core/config/app.enums.config';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { InvitationListRequestDto } from 'src/app/core/shared/dtos/invitation-list-request-dto.modal';
import { InvitationResponseDto, InvitationListResponseDto } from 'src/app/core/shared/dtos/invitation-response-dto.modal';
import {
  getInvitations,
  getInvitationsOk,
  getInvitationsError,
  resendInvitation,
  resendInvitationOk,
  resendInvitationError
} from 'src/app/core/shared/stores/authentification/authentification.actions';
import { ResendInvitationDto } from 'src/app/core/shared/dtos/resend-invitation-dto.modal';
import { PermissionService } from 'src/app/core/shared/services/permission.service';

@Component({
  selector: 'app-invitations',
  templateUrl: './invitations.component.html',
  styleUrls: ['./invitations.component.scss']
})
export class InvitationsComponent implements OnInit, OnDestroy {
  breadCrumbItems!: Array<{}>;
  dataStateEnum: typeof DataStateEnum = DataStateEnum;
  subscriptions: Subscription[] = [];
  messages$ = new BehaviorSubject<{type: {icon: any, color: any}, title: any, message: any, dismissible: boolean}>(
    {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: '', dismissible: false}
  );

  invitations: InvitationResponseDto[] = [];
  totalElements: number = 0;
  totalPages: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;
  isLoading: boolean = false;

  // Filtres
  searchTerm: string = '';
  userTypeFilter: string = '';
  statusFilter: string = '';
  workspaceIdFilter: string = '';
  shopIdFilter: string = '';

  // Tri
  sortBy: string = 'invitationCreatedAt';
  sortDirection: string = 'desc';

  resendingInvitationEmail: string | null = null;
  isSuperAdmin: boolean = false;

  constructor(
    private storeService: Store,
    private actionService: Actions,
    private router: Router,
    private permissionService: PermissionService
  ) {}

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngOnInit() {
    // Vérifier si l'utilisateur est super admin
    this.isSuperAdmin = this.permissionService.isSuperAdmin();
    
    if (!this.isSuperAdmin) {
      // Rediriger vers la page d'accueil si l'utilisateur n'est pas super admin
      this.messages$.next(
        {type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER}, title: APP_COLORS.DANGER, message: 'Accès refusé. Seul le super administrateur peut accéder à cette page.', dismissible: false}
      );
      setTimeout(() => {
        this.router.navigate(['/admin']);
      }, 2000);
      return;
    }

    this.breadCrumbItems = [{ label: 'Admin' }, { label: 'Invitations', active: true }];
    this.actionInvitations();
    this.loadInvitations();
  }

  actionInvitations() {
    this.subscriptions.push(
      this.actionService.pipe(ofType(getInvitationsOk)).subscribe(({invitations}) => {
        this.isLoading = false;
        this.invitations = invitations.content || [];
        this.totalElements = invitations.totalElements || 0;
        this.totalPages = invitations.totalPages || 0;
        this.currentPage = invitations.number || 0;
      }),
      this.actionService.pipe(ofType(getInvitationsError)).subscribe(({messages}) => {
        this.isLoading = false;
        this.messages$.next(
          {type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER}, title: APP_COLORS.DANGER, message: messages, dismissible: false}
        );
      }),
      this.actionService.pipe(ofType(resendInvitationOk)).subscribe(() => {
        this.resendingInvitationEmail = null;
        this.loadInvitations();
      }),
      this.actionService.pipe(ofType(resendInvitationError)).subscribe(() => {
        this.resendingInvitationEmail = null;
      })
    );
  }

  loadInvitations() {
    this.isLoading = true;
    const filters: InvitationListRequestDto = {
      search: this.searchTerm || undefined,
      userType: this.userTypeFilter || undefined,
      status: this.statusFilter || undefined,
      workspaceId: this.workspaceIdFilter || undefined,
      shopId: this.shopIdFilter || undefined,
      page: this.currentPage,
      size: this.pageSize,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection
    };

    this.storeService.dispatch(getInvitations({ invitationListRequestDto: filters }));
  }

  onSearch() {
    this.currentPage = 0;
    this.loadInvitations();
  }

  onFilterChange() {
    this.currentPage = 0;
    this.loadInvitations();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadInvitations();
  }

  onSort(column: string) {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.loadInvitations();
  }

  onResendInvitation(invitation: InvitationResponseDto) {
    if (!invitation.email || this.resendingInvitationEmail === invitation.email) {
      return;
    }

    this.resendingInvitationEmail = invitation.email;
    const resendInvitationDto: ResendInvitationDto = {
      email: invitation.email
    };

    this.storeService.dispatch(resendInvitation({ resendInvitationDto }));
  }

  onViewInvitation(invitation: InvitationResponseDto) {
    if (invitation.invitationId) {
      this.router.navigate(['/admin/invitations/detail', invitation.invitationId]);
    }
  }

  getStatusBadgeClass(status: string | undefined): string {
    if (!status) return 'bg-secondary';
    switch (status.toLowerCase()) {
      case 'pending':
      case 'en_attente':
        return 'bg-warning';
      case 'accepted':
      case 'acceptée':
        return 'bg-success';
      case 'expired':
      case 'expirée':
        return 'bg-danger';
      case 'used':
      case 'utilisée':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  }

  getStatusLabel(status: string | undefined): string {
    if (!status) return 'Inconnu';
    switch (status.toLowerCase()) {
      case 'pending':
      case 'en_attente':
        return 'En attente';
      case 'accepted':
      case 'acceptée':
        return 'Acceptée';
      case 'expired':
      case 'expirée':
        return 'Expirée';
      case 'used':
      case 'utilisée':
        return 'Utilisée';
      default:
        return status;
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(0, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages - 1, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(0, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  Math = Math;
}

