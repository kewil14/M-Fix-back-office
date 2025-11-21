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
  departmentFilter: string = '';
  userTypeFilter: string = '';
  isActiveFilter: boolean | null = null;
  currentPage: number = 0;
  pageSize: number = 10;
  sortBy: string = 'createdAt';
  sortDirection: string = 'desc';

  // Options de filtres
  userTypeOptions = [
    { value: '', label: 'MESSAGES.ADMIN.COMMON.ALL_TYPES' },
    { value: 'EMPLOYEE', label: 'MESSAGES.ADMIN.COMMON.EMPLOYEE' },
    { value: 'SHOP_MANAGER', label: 'MESSAGES.ADMIN.COMMON.SHOP_MANAGER' },
    { value: 'TECHNICIAN', label: 'MESSAGES.ADMIN.COMMON.TECHNICIAN' },
    { value: 'DELIVERER', label: 'MESSAGES.ADMIN.COMMON.DELIVERER' }
  ];

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
    this.breadCrumbItems = [{ label: 'Admin' }, { label: 'Employés', active: true }];
    this.employeeState$ = this.storeService.select(selectEmployeeState).pipe();
    this.actionEmployees();
    this.loadEmployees();
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
          this.loadEmployees();
        }, 1000);
      }),
      this.actionService.pipe(ofType(loadEmployees)).subscribe(() => {
      })
    );
  }

  loadEmployees() {
    const filters: EmployeeListRequestDto = {
      search: this.searchTerm || undefined,
      department: this.departmentFilter || undefined,
      userType: this.userTypeFilter || undefined,
      isActive: this.isActiveFilter !== null ? this.isActiveFilter : undefined,
      page: this.currentPage,
      size: this.pageSize,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection
    };
    this.storeService.dispatch(findAllEmployees({ filters }));
  }

  onSearchChange(): void {
    this.currentPage = 0;
    this.loadEmployees();
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadEmployees();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.departmentFilter = '';
    this.userTypeFilter = '';
    this.isActiveFilter = null;
    this.currentPage = 0;
    this.loadEmployees();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadEmployees();
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.loadEmployees();
  }

  getPageNumbers(state: EmployeeState): number[] {
    if (!state || state.totalPages === 0) return [];
    const pages: number[] = [];
    const totalPages = state.totalPages;
    const maxPages = Math.min(5, totalPages);
    let startPage = Math.max(0, state.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxPages - 1);
    
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
            this.loadEmployees();
          }, 1000);
        }
      });
    }
  }

  onReactivate(employee: EmployeeResponseDto): void {
    this.storeService.dispatch(reactivateEmployee({ employeeId: employee.id }));
    setTimeout(() => {
      this.loadEmployees();
    }, 1000);
  }
}
