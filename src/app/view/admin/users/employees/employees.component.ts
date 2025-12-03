import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { APP_COLORS, APP_ICONS } from 'src/app/core/config/app.enums.config';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { selectEmployeeState } from 'src/app/core/core.state';
import { EmployeeListRequestDto } from 'src/app/core/shared/dtos/employee-list-request-dto';
import { EmployeeResponseDto } from 'src/app/core/shared/dtos/employee-response-dto';
import { DeleteConfirmModalComponent } from 'src/app/shared-module/components/delete-confirm-modal/delete-confirm-modal.component';
import {
  findAllEmployees,
  deleteEmployee,
  reactivateEmployee,
  erreurEmployees,
  addEmployee,
  loadEmployees
} from 'src/app/core/shared/stores/employee/employee.actions';
import { EmployeeState } from 'src/app/core/shared/stores/employee/employee.state';
import { CreateEmployeeComponent } from '../create-employee/create-employee.component';
import { MediaUrlService } from 'src/app/core/shared/services/media-url.service';
import { ShopService } from 'src/app/core/shared/services/shop.service';
import { ShopResponseDto } from 'src/app/core/shared/dtos/shop-response-dto';
import { PermissionService } from 'src/app/core/shared/services/permission.service';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements OnInit, OnDestroy {
  modalRef?: BsModalRef;
  breadCrumbItems!: Array<{}>;
  employeeState$!: Observable<EmployeeState>;
  dataStateEnum: typeof DataStateEnum = DataStateEnum;
  subscriptions: Subscription[] = [];
  messages$ = new BehaviorSubject<{type: {icon: any, color: any}, title: any, message: any, dismissible: boolean}>(
    {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: '', dismissible: false}
  );

  searchTerm: string = '';
  shopFilter: string = '';
  userTypeFilter: string = '';
  isActiveFilter: boolean | null = null;
  currentPage: number = 0;
  pageSize: number = 10;
  sortBy: string = 'createdAt';
  sortDirection: string = 'desc';
  
  // Données complètes chargées une fois
  allEmployees: EmployeeResponseDto[] = [];
  filteredEmployees: EmployeeResponseDto[] = [];
  displayedEmployees: EmployeeResponseDto[] = [];
  
  // Liste des shops pour le filtre
  shops: ShopResponseDto[] = [];

  // Options de filtres
  userTypeOptions = [
    { value: '', label: 'MESSAGES.ADMIN.COMMON.ALL_TYPES' },
    { value: 'EMPLOYEE', label: 'MESSAGES.ADMIN.COMMON.EMPLOYEE' },
    { value: 'TECHNICIAN', label: 'MESSAGES.ADMIN.COMMON.TECHNICIAN' },
    { value: 'DELIVERER', label: 'MESSAGES.ADMIN.COMMON.DELIVERER' }
  ];

  constructor(
    private modalService: BsModalService,
    private storeService: Store,
    private actionService: Actions,
    private router: Router,
    private translateService: TranslateService,
    public mediaUrlService: MediaUrlService,
    private shopService: ShopService,
    private permissionService: PermissionService
  ) {}

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Admin' }, { label: 'Employés', active: true }];
    this.employeeState$ = this.storeService.select(selectEmployeeState).pipe();
    this.actionEmployees();
    
    // Charger la liste des shops
    this.loadShops();
    
    // S'abonner au state pour récupérer toutes les données
    this.subscriptions.push(
      this.employeeState$.subscribe(state => {
        if (state.dataState === DataStateEnum.SUCCESS && state.employees) {
          // Stocker toutes les données une fois chargées
          if (this.allEmployees.length === 0 || state.employees.length > this.allEmployees.length) {
            this.allEmployees = [...state.employees];
          }
          this.applyFilters();
        }
      })
    );
    
    // Charger toutes les données au début (sans filtres, grande taille)
    this.loadAllEmployees();
  }
  
  loadShops(): void {
    const workspaceId = this.permissionService.getWorkspaceId();
    this.shopService.getShops(workspaceId || undefined).subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS' && res.data) {
          this.shops = Array.isArray(res.data) ? res.data : [];
          console.log('[EmployeesComponent] Loaded shops:', this.shops.length);
        }
      },
      error: (err) => {
        console.error('[EmployeesComponent] Error loading shops:', err);
      }
    });
  }
  
  getShopName(shopId: string | undefined): string {
    if (!shopId) return 'N/A';
    const shop = this.shops.find(s => s.id === shopId);
    return shop?.name || shopId;
  }

  actionEmployees() {
    this.subscriptions.push(
      this.actionService.pipe(ofType(erreurEmployees)).subscribe(({messages}) => {
        this.messages$.next(
          {type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER}, title: APP_COLORS.DANGER, message: messages, dismissible: false}
        );
      }),
      this.actionService.pipe(ofType(addEmployee)).subscribe(() => {
        this.messages$.next(
          {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: 'Employé créé avec succès!', dismissible: false}
        );
        setTimeout(() => {
          this.loadAllEmployees();
        }, 1000);
      }),
      this.actionService.pipe(ofType(loadEmployees)).subscribe(() => {
      })
    );
  }

  // Charger toutes les données une seule fois au début
  loadAllEmployees() {
    const filters: EmployeeListRequestDto = {
      page: 0,
      size: 100, // Charger beaucoup de données
      sortBy: this.sortBy,
      sortDirection: this.sortDirection
    };
    this.storeService.dispatch(findAllEmployees({ filters }));
  }

  // Appliquer les filtres localement sans recharger
  applyFilters(): void {
    let filtered = [...this.allEmployees];
    
    // Filtre par recherche
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(emp => 
        (emp.firstName || '').toLowerCase().includes(term) ||
        (emp.lastName || '').toLowerCase().includes(term) ||
        (emp.email || '').toLowerCase().includes(term) ||
        (emp.username || '').toLowerCase().includes(term)
      );
    }
    
    // Filtre par type
    if (this.userTypeFilter) {
      filtered = filtered.filter(emp => emp.type === this.userTypeFilter);
    }
    
    // Filtre par shop
    if (this.shopFilter) {
      filtered = filtered.filter(emp => emp.shopId === this.shopFilter);
    }
    
    // Filtre par statut actif
    if (this.isActiveFilter !== null) {
      filtered = filtered.filter(emp => emp.isActive === this.isActiveFilter);
    }
    
    // Trier
    filtered = this.sortData(filtered);
    
    this.filteredEmployees = filtered;
    this.applyPagination();
  }

  // Trier les données
  sortData(data: EmployeeResponseDto[]): EmployeeResponseDto[] {
    return [...data].sort((a, b) => {
      let aVal: any = a[this.sortBy as keyof EmployeeResponseDto];
      let bVal: any = b[this.sortBy as keyof EmployeeResponseDto];
      
      if (aVal === null || aVal === undefined) aVal = '';
      if (bVal === null || bVal === undefined) bVal = '';
      
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  // Appliquer la pagination
  applyPagination(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedEmployees = this.filteredEmployees.slice(startIndex, endIndex);
  }

  onSearchChange(): void {
    this.currentPage = 0;
    this.applyFilters();
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.shopFilter = '';
    this.userTypeFilter = '';
    this.isActiveFilter = null;
    this.currentPage = 0;
    this.applyFilters();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.applyPagination();
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.applyPagination();
  }

  getPageNumbers(): number[] {
    const totalPages = Math.ceil(this.filteredEmployees.length / this.pageSize);
    if (totalPages === 0) return [];
    const pages: number[] = [];
    const maxPages = Math.min(5, totalPages);
    let startPage = Math.max(0, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxPages - 1);
    
    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(0, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  getTotalElements(): number {
    return this.filteredEmployees.length;
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredEmployees.length / this.pageSize);
  }

  get Math() {
    return Math;
  }

  openCreateModal() {
    this.modalRef = this.modalService.show(CreateEmployeeComponent, { 
      class: 'modal-lg',
      backdrop: true,
      ignoreBackdropClick: true
    });
  }

  onEdit(employee: EmployeeResponseDto): void {
    // Rediriger vers la page d'édition
    this.router.navigate(['/admin/employees/edit', employee.id]);
  }

  onView(employee: EmployeeResponseDto): void {
    // Rediriger vers la page de détail
    this.router.navigate(['/admin/employees/detail', employee.id]);
  }

  onDelete(employee: EmployeeResponseDto): void {
    const initialState = {
      title: this.translateService.instant('MESSAGES.ADMIN.EMPLOYEE.DELETE_TITLE'),
      message: this.translateService.instant('MESSAGES.ADMIN.EMPLOYEE.DELETE_MESSAGE'),
      itemName: `${employee.firstName} ${employee.lastName}`,
      confirmBtnText: this.translateService.instant('MESSAGES.ADMIN.EMPLOYEE.DELETE_BUTTON'),
      cancelBtnText: this.translateService.instant('MESSAGES.ADMIN.SHOP.CANCEL')
    };
    
    this.modalRef = this.modalService.show(DeleteConfirmModalComponent, {
      initialState,
      class: 'modal-dialog-centered'
    });
    
    if (this.modalRef.content) {
      this.modalRef.content.onConfirm.subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.storeService.dispatch(deleteEmployee({ employeeId: employee.id }));
          setTimeout(() => {
            this.loadAllEmployees();
          }, 1000);
        }
      });
    }
  }

  onReactivate(employee: EmployeeResponseDto): void {
    this.storeService.dispatch(reactivateEmployee({ employeeId: employee.id }));
    setTimeout(() => {
      this.loadAllEmployees();
    }, 1000);
  }
}
