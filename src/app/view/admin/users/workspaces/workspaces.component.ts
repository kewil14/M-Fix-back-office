import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BehaviorSubject, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { APP_COLORS, APP_ICONS } from 'src/app/core/config/app.enums.config';
import { DeleteConfirmModalComponent } from 'src/app/shared-module/components/delete-confirm-modal/delete-confirm-modal.component';
import { WorkspaceService } from 'src/app/core/shared/services/workspace.service';
import { PermissionService } from 'src/app/core/shared/services/permission.service';
import { WorkspaceResponseDto, WorkspaceListRequestDto } from 'src/app/core/shared/dtos/workspace-response-dto';
import { RequestResultDto } from 'src/app/core/shared/dtos/request-result-dto.modal';
import { CreateWorkspaceAdminComponent } from '../create-workspace-admin/create-workspace-admin.component';

@Component({
  selector: 'app-workspaces',
  templateUrl: './workspaces.component.html',
  styleUrls: ['./workspaces.component.scss']
})
export class WorkspacesComponent implements OnInit, OnDestroy {
  modalRef?: BsModalRef;
  breadCrumbItems!: Array<{}>;
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
  allWorkspaces: WorkspaceResponseDto[] = [];
  filteredWorkspaces: WorkspaceResponseDto[] = [];
  paginatedWorkspaces: WorkspaceResponseDto[] = [];
  totalElements: number = 0;
  totalPages: number = 0;
  
  isLoading: boolean = false;

  constructor(
    private modalService: BsModalService,
    private router: Router,
    private translateService: TranslateService,
    private workspaceService: WorkspaceService,
    public permissionService: PermissionService
  ) {}

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Admin' }, { label: 'Workspaces', active: true }];
    this.loadWorkspaces();
  }

  loadWorkspaces(): void {
    this.isLoading = true;
    const filters: WorkspaceListRequestDto = {
      page: this.currentPage,
      size: 1000, // Charger beaucoup de données pour le filtrage frontend
      isActive: this.isActiveFilter !== null ? this.isActiveFilter : undefined
    };
    
    this.workspaceService.getWorkspaces(filters).subscribe({
      next: (response: RequestResultDto<any>) => {
        this.isLoading = false;
        if (response.status === 'SUCCESS' && response.data?.content) {
          this.allWorkspaces = response.data.content;
          this.applyFilters();
        } else {
          this.allWorkspaces = [];
          this.filteredWorkspaces = [];
          this.paginatedWorkspaces = [];
          this.totalElements = 0;
          this.totalPages = 0;
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading workspaces:', error);
        this.messages$.next({
          type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER},
          title: APP_COLORS.DANGER,
          message: error?.error?.message || 'Erreur lors du chargement des workspaces',
          dismissible: true
        });
      }
    });
  }

  applyFilters(): void {
    // Filtrer les données localement
    this.filteredWorkspaces = this.allWorkspaces.filter(workspace => {
      // Filtre de recherche
      const matchesSearch = !this.searchTerm || 
        workspace.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        workspace.description?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        workspace.slug?.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Filtre de statut
      const matchesStatus = this.isActiveFilter === null || workspace.isActive === this.isActiveFilter;

      return matchesSearch && matchesStatus;
    });

    // Trier
    this.filteredWorkspaces = this.sortData(this.filteredWorkspaces);

    // Appliquer la pagination
    this.applyPagination();
  }

  sortData(data: WorkspaceResponseDto[]): WorkspaceResponseDto[] {
    return [...data].sort((a, b) => {
      let aVal: any = (a as any)[this.sortBy];
      let bVal: any = (b as any)[this.sortBy];
      
      if (aVal === null || aVal === undefined) aVal = '';
      if (bVal === null || bVal === undefined) bVal = '';
      
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
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
    this.loadWorkspaces(); // Recharger avec le nouveau filtre isActive
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.isActiveFilter = null;
    this.currentPage = 0;
    this.loadWorkspaces();
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
    
    // Recharger après la création
    if (this.modalRef.content) {
      this.subscriptions.push(
        (this.modalRef.content as any).onClose?.subscribe(() => {
          this.loadWorkspaces();
        }) || new BehaviorSubject(null).subscribe()
      );
    }
  }

  onView(workspace: WorkspaceResponseDto): void {
    if (workspace.id) {
      // TODO: Créer une page de détail pour les workspaces
      // this.router.navigate(['/admin/workspaces/detail', workspace.id]);
      console.log('View workspace:', workspace);
    }
  }

  onEdit(workspace: WorkspaceResponseDto): void {
    if (workspace.id) {
      // TODO: Créer une page d'édition pour les workspaces
      // this.router.navigate(['/admin/workspaces/edit', workspace.id]);
      console.log('Edit workspace:', workspace);
    }
  }

  onDelete(workspace: WorkspaceResponseDto): void {
    const initialState = {
      title: this.translateService.instant('MESSAGES.ADMIN.WORKSPACE.DELETE_TITLE'),
      message: this.translateService.instant('MESSAGES.ADMIN.WORKSPACE.DELETE_MESSAGE'),
      itemName: workspace.name,
      confirmBtnText: this.translateService.instant('MESSAGES.ADMIN.WORKSPACE.DELETE_BUTTON'),
      cancelBtnText: this.translateService.instant('MESSAGES.ADMIN.SHOP.CANCEL')
    };
    
    this.modalRef = this.modalService.show(DeleteConfirmModalComponent, {
      initialState,
      class: 'modal-dialog-centered'
    });
    
    if (this.modalRef.content) {
      this.modalRef.content.onConfirm.subscribe((confirmed: boolean) => {
        if (confirmed && workspace.id) {
          this.workspaceService.deleteWorkspace(workspace.id).subscribe({
            next: (response) => {
              if (response.status === 'SUCCESS') {
                this.messages$.next({
                  type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS},
                  title: APP_COLORS.SUCCESS,
                  message: 'Workspace désactivé avec succès!',
                  dismissible: true
                });
                setTimeout(() => {
                  this.loadWorkspaces();
                }, 1000);
              }
            },
            error: (error) => {
              this.messages$.next({
                type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER},
                title: APP_COLORS.DANGER,
                message: error?.error?.message || 'Erreur lors de la désactivation du workspace',
                dismissible: true
              });
            }
          });
        }
      });
    }
  }

  onReactivate(workspace: WorkspaceResponseDto): void {
    if (!workspace.id) return;
    
    this.workspaceService.reactivateWorkspace(workspace.id).subscribe({
      next: (response) => {
        if (response.status === 'SUCCESS') {
          this.messages$.next({
            type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS},
            title: APP_COLORS.SUCCESS,
            message: 'Workspace réactivé avec succès!',
            dismissible: true
          });
          setTimeout(() => {
            this.loadWorkspaces();
          }, 1000);
        }
      },
      error: (error) => {
        this.messages$.next({
          type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER},
          title: APP_COLORS.DANGER,
          message: error?.error?.message || 'Erreur lors de la réactivation du workspace',
          dismissible: true
        });
      }
    });
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
