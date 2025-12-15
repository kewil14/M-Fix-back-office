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

  // Frontend filtering
  allInvitations: InvitationResponseDto[] = [];
  filteredInvitations: InvitationResponseDto[] = [];
  paginatedInvitations: InvitationResponseDto[] = [];

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
    
    // Le guard a déjà vérifié l'accès, donc on peut supposer que si on arrive ici, l'utilisateur a le droit d'accéder
    // La vérification supplémentaire n'est plus nécessaire car le guard gère déjà la restriction

    this.breadCrumbItems = [{ label: 'Admin' }, { label: 'Invitations', active: true }];
    this.actionInvitations();
    this.loadInvitations();
  }

  actionInvitations() {
    this.subscriptions.push(
      this.actionService.pipe(ofType(getInvitationsOk)).subscribe(({invitations}) => {
        this.isLoading = false;
        this.allInvitations = invitations.content || [];
        this.applyFilters();
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
    // Charger toutes les données une fois
    const filters: InvitationListRequestDto = {
      search: undefined,
      userType: undefined,
      status: undefined,
      workspaceId: undefined,
      shopId: undefined,
      page: 0,
      size: 100, // Charger toutes les données
      sortBy: this.sortBy,
      sortDirection: this.sortDirection
    };

    this.storeService.dispatch(getInvitations({ invitationListRequestDto: filters }));
  }

  applyFilters(): void {
    // Filtrer les données localement
    this.filteredInvitations = this.allInvitations.filter(invitation => {
      // Filtre de recherche
      const matchesSearch = !this.searchTerm || 
        (invitation.email?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
         invitation.firstName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
         invitation.lastName?.toLowerCase().includes(this.searchTerm.toLowerCase()));

      // Filtre de type d'utilisateur (utilise 'type' au lieu de 'userType')
      const matchesUserType = !this.userTypeFilter || invitation.type === this.userTypeFilter;

      // Filtre de statut
      const matchesStatus = !this.statusFilter || invitation.status === this.statusFilter;

      // Les filtres workspaceId et shopId ne sont pas disponibles dans InvitationResponseDto
      // Si ces filtres sont nécessaires, ils devront être ajoutés au DTO ou supprimés de l'interface

      return matchesSearch && matchesUserType && matchesStatus;
    });

    // Trier les données filtrées
    this.sortFilteredInvitations();

    // Appliquer la pagination
    this.applyPagination();
  }

  applyPagination(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedInvitations = this.filteredInvitations.slice(startIndex, endIndex);
    this.invitations = this.paginatedInvitations; // Pour compatibilité avec le template
    this.totalElements = this.filteredInvitations.length;
    this.totalPages = Math.ceil(this.totalElements / this.pageSize);
  }

  onSearch() {
    this.currentPage = 0;
    this.applyFilters();
  }

  onFilterChange() {
    this.currentPage = 0;
    this.applyFilters();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.applyFilters();
  }

  onSort(column: string) {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    // Trier les données localement
    this.sortFilteredInvitations();
    this.applyPagination();
  }

  sortFilteredInvitations(): void {
    this.filteredInvitations.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (this.sortBy) {
        case 'email':
          aValue = a.email?.toLowerCase() || '';
          bValue = b.email?.toLowerCase() || '';
          break;
        case 'invitationCreatedAt':
          aValue = a.invitationCreatedAt ? new Date(a.invitationCreatedAt).getTime() : 0;
          bValue = b.invitationCreatedAt ? new Date(b.invitationCreatedAt).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
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

