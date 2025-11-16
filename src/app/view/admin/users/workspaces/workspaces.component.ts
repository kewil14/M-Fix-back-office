import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
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

  // Filtres et pagination
  searchTerm: string = '';
  isActiveFilter: boolean | null = null;
  currentPage: number = 0;
  pageSize: number = 10;
  sortBy: string = 'assignedAt';
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
    this.breadCrumbItems = [{ label: 'Admin' }, { label: 'Workspaces', active: true }];
    this.workspaceAdminState$ = this.storeService.select(selectWorkspaceAdminState).pipe();
    this.actionWorkspaces();
    this.loadWorkspaces();
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
        // Les workspace admins sont chargés
      })
    );
  }

  loadWorkspaces() {
    const filters: WorkspaceAdminListRequestDto = {
      search: this.searchTerm || undefined,
      isActive: this.isActiveFilter !== null ? this.isActiveFilter : undefined,
      page: this.currentPage,
      size: this.pageSize,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection
    };
    this.storeService.dispatch(findAllWorkspaceAdmins({ filters }));
  }

  onSearchChange(): void {
    this.currentPage = 0;
    this.loadWorkspaces();
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadWorkspaces();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadWorkspaces();
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.loadWorkspaces();
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
      // Rediriger vers la page de détail si nécessaire
    }
  }

  onEdit(workspaceAdmin: EmployeeResponseDto): void {
    if (workspaceAdmin.id) {
      // Rediriger vers la page d'édition si nécessaire
    }
  }

  onDelete(workspaceAdmin: EmployeeResponseDto): void {
    const initialState = {
      title: 'Désactiver le workspace',
      message: 'Êtes-vous sûr de vouloir désactiver ce workspace ? Cela désactivera également tous les employés du workspace.',
      itemName: `${workspaceAdmin.firstName} ${workspaceAdmin.lastName}`,
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
}
