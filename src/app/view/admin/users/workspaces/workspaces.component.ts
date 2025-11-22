import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { APP_COLORS, APP_ICONS } from 'src/app/core/config/app.enums.config';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { selectWorkspaceAdminState } from 'src/app/core/core.state';
import { WorkspaceAdminListRequestDto } from 'src/app/core/shared/dtos/workspace-admin-list-request-dto';
import { EmployeeResponseDto } from 'src/app/core/shared/dtos/employee-response-dto';
import { DeleteConfirmModalComponent } from 'src/app/shared-module/components/delete-confirm-modal/delete-confirm-modal.component';
import { createWorkspaceWithAdminOk, erreursAuthentification } from 'src/app/core/shared/stores/authentification/authentification.actions';
import {
  findAllWorkspaceAdmins,
  deleteWorkspaceAdmin,
  reactivateWorkspaceAdmin,
  erreurWorkspaceAdmins,
  addWorkspaceAdmin,
  loadWorkspaceAdmins
} from 'src/app/core/shared/stores/workspace-admin/workspace-admin.actions';
import { WorkspaceAdminState } from 'src/app/core/shared/stores/workspace-admin/workspace-admin.state';
import { CreateWorkspaceAdminComponent } from '../create-workspace-admin/create-workspace-admin.component';
import { WorkspaceService } from 'src/app/core/shared/services/workspace.service';
import { PermissionService } from 'src/app/core/shared/services/permission.service';

@Component({
  selector: 'app-workspaces',
  templateUrl: './workspaces.component.html',
  styleUrls: ['./workspaces.component.scss']
})
export class WorkspacesComponent implements OnInit, OnDestroy {
  modalRef?: BsModalRef;
  breadCrumbItems!: Array<{}>;
  workspaceAdminState$!: Observable<WorkspaceAdminState>;
  dataStateEnum: typeof DataStateEnum = DataStateEnum;
  subscriptions: Subscription[] = [];
  messages$ = new BehaviorSubject<{type: {icon: any, color: any}, title: any, message: any, dismissible: boolean}>(
    {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: '', dismissible: false}
  );

  searchTerm: string = '';
  isActiveFilter: boolean | null = null;
  currentPage: number = 0;
  pageSize: number = 10;
  sortBy: string = 'assignedAt';
  sortDirection: string = 'desc';

  // Frontend filtering
  allWorkspaces: EmployeeResponseDto[] = [];
  filteredWorkspaces: EmployeeResponseDto[] = [];
  paginatedWorkspaces: EmployeeResponseDto[] = [];
  totalElements: number = 0;
  totalPages: number = 0;

  constructor(
    private modalService: BsModalService,
    private storeService: Store,
    private actionService: Actions,
    private router: Router,
    private translateService: TranslateService,
    private workspaceService: WorkspaceService,
    private permissionService: PermissionService
  ) {}

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Admin' }, { label: 'Workspaces', active: true }];
    this.workspaceAdminState$ = this.storeService.select(selectWorkspaceAdminState).pipe();
    this.actionWorkspaces();
    this.loadWorkspaces();
    
    // Écouter les changements du state pour mettre à jour les données
    this.subscriptions.push(
      this.workspaceAdminState$.subscribe(state => {
        if (state && state.dataState === DataStateEnum.SUCCESS && state.workspaceAdmins) {
          this.allWorkspaces = state.workspaceAdmins;
          this.applyFilters();
        }
      })
    );
  }

  actionWorkspaces() {
    this.subscriptions.push(
      this.actionService.pipe(ofType(erreurWorkspaceAdmins)).subscribe(({messages}) => {
        this.messages$.next(
          {type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER}, title: APP_COLORS.DANGER, message: messages, dismissible: false}
        );
      }),
      this.actionService.pipe(ofType(addWorkspaceAdmin)).subscribe(() => {
        this.messages$.next(
          {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: 'Workspace créé avec succès!', dismissible: false}
        );
        setTimeout(() => {
          this.loadWorkspaces();
        }, 1000);
      }),
      this.actionService.pipe(ofType(createWorkspaceWithAdminOk)).subscribe(
        ({data}) => {
          this.messages$.next(
            {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: 'Workspace créé avec succès!', dismissible: false}
          );
          setTimeout(() => {
            this.loadWorkspaces();
          }, 1000);
        }
      ),
      this.actionService.pipe(ofType(loadWorkspaceAdmins)).subscribe(() => {
      })
    );
  }

  loadWorkspaces() {
    // Charger toutes les données une fois
    const filters: WorkspaceAdminListRequestDto = {
      search: undefined,
      isActive: undefined,
      page: 0,
      size: 10000, // Charger toutes les données
      sortBy: this.sortBy,
      sortDirection: this.sortDirection
    };
    this.storeService.dispatch(findAllWorkspaceAdmins({ filters }));
  }

  applyFilters(): void {
    // Filtrer les données localement
    this.filteredWorkspaces = this.allWorkspaces.filter(workspace => {
      // Filtre de recherche
      const matchesSearch = !this.searchTerm || 
        (workspace.firstName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
         workspace.lastName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
         workspace.email?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
         workspace.username?.toLowerCase().includes(this.searchTerm.toLowerCase()));

      // Filtre de statut
      const matchesStatus = this.isActiveFilter === null || workspace.isActive === this.isActiveFilter;

      return matchesSearch && matchesStatus;
    });

    // Appliquer la pagination
    this.applyPagination();
  }

  applyPagination(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedWorkspaces = this.filteredWorkspaces.slice(startIndex, endIndex);
    this.totalElements = this.filteredWorkspaces.length;
    this.totalPages = Math.ceil(this.totalElements / this.pageSize);
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

  getPageNumbers(state: WorkspaceAdminState): number[] {
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

  get Math() {
    return Math;
  }

  openCreateModal() {
    this.modalRef = this.modalService.show(CreateWorkspaceAdminComponent, { 
      class: 'modal-lg',
      backdrop: true,
      ignoreBackdropClick: true
    });
  }

  onView(workspaceAdmin: EmployeeResponseDto): void {
    if (workspaceAdmin.id) {
      this.router.navigate(['/admin/workspaces/detail', workspaceAdmin.id]);
    }
  }

  onEdit(workspaceAdmin: EmployeeResponseDto): void {
    if (workspaceAdmin.id) {
      this.router.navigate(['/admin/workspaces/edit', workspaceAdmin.id]);
    }
  }

  onDelete(workspaceAdmin: EmployeeResponseDto): void {
    const initialState = {
      title: this.translateService.instant('MESSAGES.ADMIN.WORKSPACE.DELETE_TITLE'),
      message: this.translateService.instant('MESSAGES.ADMIN.WORKSPACE.DELETE_MESSAGE'),
      itemName: `${workspaceAdmin.firstName} ${workspaceAdmin.lastName}`,
      confirmBtnText: this.translateService.instant('MESSAGES.ADMIN.WORKSPACE.DELETE_BUTTON'),
      cancelBtnText: this.translateService.instant('MESSAGES.ADMIN.SHOP.CANCEL')
    };
    
    this.modalRef = this.modalService.show(DeleteConfirmModalComponent, {
      initialState,
      class: 'modal-dialog-centered'
    });
    
    if (this.modalRef.content) {
      this.modalRef.content.onConfirm.subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.storeService.dispatch(deleteWorkspaceAdmin({ workspaceAdminId: workspaceAdmin.id }));
          setTimeout(() => {
            this.loadWorkspaces();
          }, 1000);
        }
      });
    }
  }

  onReactivate(workspaceAdmin: EmployeeResponseDto): void {
    this.storeService.dispatch(reactivateWorkspaceAdmin({ workspaceAdminId: workspaceAdmin.id }));
    setTimeout(() => {
      this.loadWorkspaces();
    }, 1000);
  }

  onExportWorkspaces(): void {
    if (!this.permissionService.isSuperAdmin()) {
      this.messages$.next({
        type: { icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER },
        title: APP_COLORS.DANGER,
        message: this.translateService.instant('MESSAGES.ERRORS.PERMISSION_DENIED'),
        dismissible: true
      });
      return;
    }

    this.workspaceService.exportWorkspaces(
      this.isActiveFilter !== null ? this.isActiveFilter : undefined
    ).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `workspaces_${new Date().getTime()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        this.messages$.next({
          type: { icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS },
          title: APP_COLORS.SUCCESS,
          message: this.translateService.instant('MESSAGES.SUCCESS_ACTION.WORKSPACE_EXPORT'),
          dismissible: true
        });
      },
      error: (error) => {
        console.error('Error exporting workspaces:', error);
        this.messages$.next({
          type: { icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER },
          title: APP_COLORS.DANGER,
          message: error?.error?.message || this.translateService.instant('MESSAGES.ERRORS.EXPORT'),
          dismissible: true
        });
      }
    });
  }
}
