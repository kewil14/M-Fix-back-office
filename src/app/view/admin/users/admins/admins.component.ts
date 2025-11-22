import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BehaviorSubject, Observable, Subscription, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { APP_COLORS, APP_ICONS } from 'src/app/core/config/app.enums.config';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { selectAdminState } from 'src/app/core/core.state';
import { AdminListRequestDto } from 'src/app/core/shared/dtos/admin-list-request-dto';
import { EmployeeResponseDto } from 'src/app/core/shared/dtos/employee-response-dto';
import { DeleteConfirmModalComponent } from 'src/app/shared-module/components/delete-confirm-modal/delete-confirm-modal.component';
import { createAdminOk, erreursAuthentification } from 'src/app/core/shared/stores/authentification/authentification.actions';
import {
  findAllAdmins,
  deleteAdmin,
  reactivateAdmin,
  erreurAdmins,
  addAdmin,
  loadAdmins
} from 'src/app/core/shared/stores/admin/admin.actions';
import { AdminState } from 'src/app/core/shared/stores/admin/admin.state';
import { CreateAdminComponent } from '../create-admin/create-admin.component';

@Component({
  selector: 'app-admins',
  templateUrl: './admins.component.html',
  styleUrls: ['./admins.component.scss']
})
export class AdminsComponent implements OnInit, OnDestroy {
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
  private searchSubject = new Subject<string>();

  // Frontend filtering
  allAdmins: EmployeeResponseDto[] = [];
  filteredAdmins: EmployeeResponseDto[] = [];
  paginatedAdmins: EmployeeResponseDto[] = [];
  totalElements: number = 0;
  totalPages: number = 0;

  constructor(
    private modalService: BsModalService,
    private storeService: Store,
    private actionService: Actions,
    private router: Router,
    private translateService: TranslateService
  ) {}

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Admin' }, { label: 'Administrateurs', active: true }];
    this.adminState$ = this.storeService.select(selectAdminState).pipe();
    this.actionAdmins();
    
    // Debounce pour la recherche
    this.subscriptions.push(
      this.searchSubject.pipe(
        debounceTime(500),
        distinctUntilChanged()
      ).subscribe(() => {
        this.onSearchChange();
      })
    );
    
    // Écouter les changements du state pour mettre à jour les données
    this.subscriptions.push(
      this.adminState$.subscribe(state => {
        if (state && state.dataState === DataStateEnum.SUCCESS && state.admins) {
          this.allAdmins = state.admins.filter(user => this.isAdminOrSuperAdmin(user));
          this.applyFilters();
        }
      })
    );
    
    this.loadAdmins();
  }

  actionAdmins() {
    this.subscriptions.push(
      this.actionService.pipe(ofType(erreurAdmins)).subscribe(({messages}) => {
        this.messages$.next(
          {type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER}, title: APP_COLORS.DANGER, message: messages, dismissible: false}
        );
      }),
      this.actionService.pipe(ofType(addAdmin)).subscribe(() => {
        this.messages$.next(
          {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: 'Administrateur créé avec succès!', dismissible: false}
        );
        setTimeout(() => {
          this.loadAdmins();
        }, 1000);
      }),
      this.actionService.pipe(ofType(createAdminOk)).subscribe(
        ({user}) => {
          this.messages$.next(
            {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: 'Administrateur créé avec succès!', dismissible: false}
          );
          setTimeout(() => {
            this.loadAdmins();
          }, 1000);
        }
      ),
      this.actionService.pipe(ofType(loadAdmins)).subscribe(() => {
      })
    );
  }

  loadAdmins() {
    // Charger toutes les données une fois
    const filters: AdminListRequestDto = {
      search: undefined,
      isActive: undefined,
      isSuperAdmin: undefined,
      page: 0,
      size: 10000, // Charger toutes les données
      sortBy: this.sortBy,
      sortDirection: this.sortDirection
    };
    this.storeService.dispatch(findAllAdmins({ filters }));
  }

  applyFilters(): void {
    // Filtrer les données localement
    this.filteredAdmins = this.allAdmins.filter(admin => {
      // Filtre de recherche
      const matchesSearch = !this.searchTerm || 
        (admin.firstName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
         admin.lastName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
         admin.email?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
         admin.username?.toLowerCase().includes(this.searchTerm.toLowerCase()));

      // Filtre de statut
      const matchesStatus = this.isActiveFilter === null || admin.isActive === this.isActiveFilter;

      return matchesSearch && matchesStatus;
    });

    // Appliquer la pagination
    this.applyPagination();
  }

  applyPagination(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedAdmins = this.filteredAdmins.slice(startIndex, endIndex);
    this.totalElements = this.filteredAdmins.length;
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

  getFilteredAdmins(state: AdminState): EmployeeResponseDto[] {
    // Cette méthode n'est plus utilisée, on utilise paginatedAdmins maintenant
    return this.paginatedAdmins;
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

  onSearchChange(): void {
    this.currentPage = 0;
    this.applyFilters();
  }

  onSearchInput(value: string): void {
    this.searchTerm = value;
    this.searchSubject.next(value);
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.applyFilters();
  }

  onSearchKeyUp(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearchChange();
    }
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.isActiveFilter = null;
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
    this.modalRef = this.modalService.show(CreateAdminComponent, { 
      class: 'modal-lg',
      backdrop: true,
      ignoreBackdropClick: true
    });
  }

  onView(admin: EmployeeResponseDto): void {
    if (admin.id) {
      this.router.navigate(['/admin/admins/detail', admin.id]);
    }
  }

  onEdit(admin: EmployeeResponseDto): void {
    if (admin.id) {
      this.router.navigate(['/admin/admins/edit', admin.id]);
    }
  }

  onDelete(admin: EmployeeResponseDto): void {
    const initialState = {
      title: this.translateService.instant('MESSAGES.ADMIN.ADMIN.DELETE_TITLE'),
      message: this.translateService.instant('MESSAGES.ADMIN.ADMIN.DELETE_MESSAGE'),
      itemName: `${admin.firstName} ${admin.lastName}`,
      confirmBtnText: this.translateService.instant('MESSAGES.ADMIN.ADMIN.DELETE_BUTTON'),
      cancelBtnText: this.translateService.instant('MESSAGES.ADMIN.SHOP.CANCEL')
    };
    
    this.modalRef = this.modalService.show(DeleteConfirmModalComponent, {
      initialState,
      class: 'modal-dialog-centered'
    });
    
    if (this.modalRef.content) {
      this.modalRef.content.onConfirm.subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.storeService.dispatch(deleteAdmin({ adminId: admin.id }));
          setTimeout(() => {
            this.loadAdmins();
          }, 1000);
        }
      });
    }
  }

  onReactivate(admin: EmployeeResponseDto): void {
    this.storeService.dispatch(reactivateAdmin({ adminId: admin.id }));
    setTimeout(() => {
      this.loadAdmins();
    }, 1000);
  }
}
