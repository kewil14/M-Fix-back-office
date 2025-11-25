import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { APP_COLORS, APP_ICONS } from 'src/app/core/config/app.enums.config';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { selectAdminState } from 'src/app/core/core.state';
import { AdminListRequestDto } from 'src/app/core/shared/dtos/admin-list-request-dto';
import { EmployeeResponseDto } from 'src/app/core/shared/dtos/employee-response-dto';
import { DeleteConfirmModalComponent } from 'src/app/shared-module/components/delete-confirm-modal/delete-confirm-modal.component';
import {
  findAllAdmins,
  deleteAdmin,
  reactivateAdmin,
  erreurAdmins,
  addAdmin,
  loadAdmins
} from 'src/app/core/shared/stores/admin/admin.actions';
import { AdminState } from 'src/app/core/shared/stores/admin/admin.state';
import { CreateUserComponent } from '../create-user/create-user.component';
import { addUser } from 'src/app/core/shared/stores/user/user.actions';

@Component({
  selector: 'app-users-management',
  templateUrl: './users-management.component.html',
  styleUrls: ['./users-management.component.scss']
})
export class UsersManagementComponent implements OnInit, OnDestroy {
  modalRef?: BsModalRef;
  breadCrumbItems!: Array<{}>;
  adminState$!: Observable<AdminState>;
  dataStateEnum: typeof DataStateEnum = DataStateEnum;
  subscriptions: Subscription[] = [];
  messages$ = new BehaviorSubject<{type: {icon: any, color: any}, title: any, message: any, dismissible: boolean}>(
    {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: '', dismissible: false}
  );

  searchTerm: string = '';
  isActiveFilter: boolean | null = null;
  currentPage: number = 0;
  pageSize: number = 10;
  sortBy: string = 'createdAt';
  sortDirection: string = 'desc';

  // Frontend filtering
  allUsers: EmployeeResponseDto[] = [];
  filteredUsers: EmployeeResponseDto[] = [];
  paginatedUsers: EmployeeResponseDto[] = [];
  totalElements: number = 0;
  totalPages: number = 0;

  constructor(
    private modalService: BsModalService,
    private storeService: Store,
    private actionService: Actions,
    private router: Router
  ) {}

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Admin' }, { label: 'Utilisateurs', active: true }];
    this.adminState$ = this.storeService.select(selectAdminState).pipe();
    this.actionUsers();
    
    // Écouter les changements du state pour mettre à jour les données
    this.subscriptions.push(
      this.adminState$.subscribe(state => {
        if (state && state.dataState === DataStateEnum.SUCCESS && state.admins) {
          this.allUsers = this.getFilteredUsers(state.admins);
          this.applyFilters();
        }
      })
    );
    
    this.loadUsers();
  }

  actionUsers() {
    this.subscriptions.push(
      this.actionService.pipe(ofType(erreurAdmins)).subscribe(({messages}) => {
        this.messages$.next(
          {type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER}, title: APP_COLORS.DANGER, message: messages, dismissible: false}
        );
      }),
      this.actionService.pipe(ofType(addUser)).subscribe(() => {
        this.messages$.next(
          {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: 'Utilisateur créé avec succès!', dismissible: false}
        );
        setTimeout(() => {
          this.loadUsers();
        }, 1000);
      }),
      this.actionService.pipe(ofType(loadAdmins)).subscribe(() => {
      })
    );
  }

  loadUsers() {
    // Charger toutes les données une fois
    const filters: AdminListRequestDto = {
      search: undefined,
      isActive: undefined,
      isSuperAdmin: undefined,
      page: 0,
      size: 100, // Charger toutes les données
      sortBy: this.sortBy,
      sortDirection: this.sortDirection
    };
    this.storeService.dispatch(findAllAdmins({ filters }));
  }

  applyFilters(): void {
    // Filtrer les données localement
    this.filteredUsers = this.allUsers.filter(user => {
      // Filtre de recherche
      const matchesSearch = !this.searchTerm || 
        (user.firstName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
         user.lastName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
         user.email?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
         user.username?.toLowerCase().includes(this.searchTerm.toLowerCase()));

      // Filtre de statut
      const matchesStatus = this.isActiveFilter === null || user.isActive === this.isActiveFilter;

      return matchesSearch && matchesStatus;
    });

    // Appliquer la pagination
    this.applyPagination();
  }

  applyPagination(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedUsers = this.filteredUsers.slice(startIndex, endIndex);
    this.totalElements = this.filteredUsers.length;
    this.totalPages = Math.ceil(this.totalElements / this.pageSize);
  }

  isAdminOrSuperAdmin(user: EmployeeResponseDto): boolean {
    if (user.type === 'ADMIN' || user.type === 'SUPER_ADMIN') {
      return true;
    }
    
    if (user.roles && user.roles.length > 0) {
      return user.roles.some(role => {
        const roleName = role.name?.toLowerCase() || role.roleName?.toLowerCase() || '';
        const roleCode = role.code?.toLowerCase() || role.roleCode?.toLowerCase() || '';
        return roleName.includes('admin') || roleName.includes('super') ||
               roleCode.includes('admin') || roleCode.includes('super');
      });
    }
    
    return false;
  }

  getFilteredUsers(users: EmployeeResponseDto[]): EmployeeResponseDto[] {
    return users.filter(user => !this.isAdminOrSuperAdmin(user));
  }

  onSearchChange(): void {
    this.currentPage = 0;
    this.applyFilters();
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.applyFilters();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.applyFilters();
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.applyFilters();
  }

  getFilteredUsersList(state: AdminState): EmployeeResponseDto[] {
    // Cette méthode n'est plus utilisée, on utilise paginatedUsers maintenant
    return this.paginatedUsers;
  }

  getPageNumbersLocal(): number[] {
    if (this.totalPages === 0) return [];
    const pages: number[] = [];
    const maxPages = Math.min(5, this.totalPages);
    let startPage = Math.max(0, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages - 1, startPage + maxPages - 1);
    
    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(0, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  getPageNumbers(state: AdminState): number[] {
    if (!state || state.totalPages === 0) return [];
    const pages: number[] = [];
    const maxPages = Math.min(5, state.totalPages);
    let startPage = Math.max(0, state.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(state.totalPages - 1, startPage + maxPages - 1);
    
    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(0, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  get Math() {
    return Math;
  }

  openCreateModal() {
    this.modalRef = this.modalService.show(CreateUserComponent, { 
      class: 'modal-lg',
      backdrop: true,
      ignoreBackdropClick: true
    });
  }

  onView(user: EmployeeResponseDto): void {
    if (user.id) {
      this.router.navigate(['/admin/admins/detail', user.id]);
    }
  }

  onEdit(user: EmployeeResponseDto): void {
    if (user.id) {
      this.router.navigate(['/admin/admins/edit', user.id]);
    }
  }

  onDelete(user: EmployeeResponseDto): void {
    const initialState = {
      title: 'Désactiver l\'utilisateur',
      message: 'Êtes-vous sûr de vouloir désactiver cet utilisateur ?',
      itemName: `${user.firstName} ${user.lastName}`,
      confirmBtnText: 'Désactiver',
      cancelBtnText: 'Annuler'
    };
    
    this.modalRef = this.modalService.show(DeleteConfirmModalComponent, {
      initialState,
      class: 'modal-dialog-centered'
    });
    
    if (this.modalRef.content) {
      this.modalRef.content.onConfirm.subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.storeService.dispatch(deleteAdmin({ adminId: user.id }));
          setTimeout(() => {
            this.loadUsers();
          }, 1000);
        }
      });
    }
  }

  onReactivate(user: EmployeeResponseDto): void {
    this.storeService.dispatch(reactivateAdmin({ adminId: user.id }));
    setTimeout(() => {
      this.loadUsers();
    }, 1000);
  }
}
