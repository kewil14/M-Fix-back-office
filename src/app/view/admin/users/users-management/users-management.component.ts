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

  // Filtres et pagination
  searchTerm: string = '';
  isActiveFilter: boolean | null = null;
  currentPage: number = 0;
  pageSize: number = 10;
  sortBy: string = 'createdAt';
  sortDirection: string = 'desc';

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
        // Les utilisateurs sont chargés
      })
    );
  }

  loadUsers() {
    const filters: AdminListRequestDto = {
      search: this.searchTerm || undefined,
      isActive: this.isActiveFilter !== null ? this.isActiveFilter : undefined,
      isSuperAdmin: undefined,
      page: this.currentPage,
      size: this.pageSize,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection
    };
    this.storeService.dispatch(findAllAdmins({ filters }));
  }

  isAdminOrSuperAdmin(user: EmployeeResponseDto): boolean {
    // Si le type est ADMIN, c'est un admin ou super_admin
    if (user.type === 'ADMIN' || user.type === 'SUPER_ADMIN') {
      return true;
    }
    
    // Sinon, vérifier les rôles si disponibles
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
    this.loadUsers();
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadUsers();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.loadUsers();
  }

  getFilteredUsersList(state: AdminState): EmployeeResponseDto[] {
    if (!state || !state.admins) return [];
    return this.getFilteredUsers(state.admins);
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
