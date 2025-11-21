import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { APP_COLORS, APP_ICONS } from 'src/app/core/config/app.enums.config';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { selectShopState } from 'src/app/core/core.state';
import { ShopListRequestDto } from 'src/app/core/shared/dtos/shop-response-dto';
import { ShopResponseDto } from 'src/app/core/shared/dtos/shop-response-dto';
import { DeleteConfirmModalComponent } from 'src/app/shared-module/components/delete-confirm-modal/delete-confirm-modal.component';
import {
  findAllShops,
  deleteShop,
  reactivateShop,
  erreurShops,
  addShop,
  loadShops
} from 'src/app/core/shared/stores/shop/shop.actions';
import { ShopState } from 'src/app/core/shared/stores/shop/shop.state';
import { CreateShopComponent } from './create-shop/create-shop.component';
import { PermissionService } from 'src/app/core/shared/services/permission.service';
import { WorkspaceService, WorkspaceDto } from 'src/app/core/shared/services/workspace.service';
import { ShopService } from 'src/app/core/shared/services/shop.service';

@Component({
  selector: 'app-shops',
  templateUrl: './shops.component.html',
  styleUrls: ['./shops.component.scss']
})
export class ShopsComponent implements OnInit, OnDestroy {
  modalRef?: BsModalRef;
  breadCrumbItems!: Array<{}>;
  shopState$!: Observable<ShopState>;
  dataStateEnum: typeof DataStateEnum = DataStateEnum;
  subscriptions: Subscription[] = [];
  messages$ = new BehaviorSubject<{type: {icon: any, color: any}, title: any, message: any, dismissible: boolean}>(
    {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: '', dismissible: false}
  );

  searchTerm: string = '';
  workspaceIdFilter: string = '';
  isActiveFilter: boolean | null = null;
  currentPage: number = 0;
  pageSize: number = 10;
  sortBy: string = 'createdAt';
  sortDirection: string = 'desc';

  workspaceId: string | null = null;
  workspaces: WorkspaceDto[] = [];
  isSuperAdmin: boolean = false;
  isLoadingWorkspaces: boolean = false;

  constructor(
    private modalService: BsModalService,
    private storeService: Store,
    private actionService: Actions,
    private router: Router,
    private translateService: TranslateService,
    public permissionService: PermissionService, // Public pour l'utiliser dans le template
    private workspaceService: WorkspaceService,
    private shopService: ShopService
  ) {}

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngOnInit() {
    this.breadCrumbItems = [
      { label: this.translateService.instant('MESSAGES.ADMIN.COMMON.ADMIN') }, 
      { label: this.translateService.instant('MESSAGES.ADMIN.COMMON.SHOPS'), active: true }
    ];
    
    // Vérifier si c'est un super admin
    this.isSuperAdmin = this.permissionService.isSuperAdmin();
    
    // Récupérer workspaceId depuis le token
    this.workspaceId = this.permissionService.getWorkspaceId();
    
    // Debug: afficher le token décodé
    const decoded = this.permissionService.getDecodedToken();
    console.log('ShopsComponent - Decoded token:', decoded);
    console.log('ShopsComponent - WorkspaceId from token:', this.workspaceId);
    console.log('ShopsComponent - Is Super Admin:', this.isSuperAdmin);
    
    this.shopState$ = this.storeService.select(selectShopState).pipe();
    this.actionShops();
    
    // S'abonner au state pour voir les changements
    this.subscriptions.push(
      this.shopState$.subscribe(state => {
        console.log('ShopsComponent - ShopState changed:', {
          dataState: state.dataState,
          shopsCount: state.shops?.length || 0,
          totalElements: state.totalElements,
          messages: state.messages
        });
      })
    );
    
    // Si super admin et pas de workspaceId, charger la liste des workspaces
    if (this.isSuperAdmin && !this.workspaceId) {
      this.loadWorkspacesForSuperAdmin();
    } else if (this.workspaceId) {
      // Workspace admin ou workspaceId trouvé, charger directement les shops
      this.loadShops();
    } else {
      console.warn('ShopsComponent - Cannot load shops: workspaceId is missing and user is not super admin');
      this.storeService.dispatch(erreurShops({ 
        messages: 'WorkspaceId est requis pour charger les shops. Veuillez vérifier votre connexion.' 
      }));
    }
  }

  loadWorkspacesForSuperAdmin() {
    this.isLoadingWorkspaces = true;
    this.workspaceService.findAllWorkspaces().subscribe({
      next: (result) => {
        this.isLoadingWorkspaces = false;
        if (result.status === 'SUCCESS' && result.data && result.data.length > 0) {
          this.workspaces = result.data;
          // Utiliser le premier workspace par défaut
          this.workspaceId = this.workspaces[0].id;
          console.log('ShopsComponent - Using first workspace:', this.workspaceId);
          this.loadShops();
        } else {
          console.error('ShopsComponent - No workspaces found');
          this.storeService.dispatch(erreurShops({ 
            messages: 'Aucun workspace trouvé. Veuillez créer un workspace d\'abord.' 
          }));
        }
      },
      error: (error) => {
        this.isLoadingWorkspaces = false;
        console.error('ShopsComponent - Error loading workspaces:', error);
        this.storeService.dispatch(erreurShops({ 
          messages: 'Erreur lors du chargement des workspaces.' 
        }));
      }
    });
  }

  onWorkspaceChange(workspaceId: string) {
    this.workspaceId = workspaceId;
    // Réinitialiser les filtres et la pagination lors du changement de workspace
    this.currentPage = 0;
    this.searchTerm = '';
    this.isActiveFilter = null;
    this.loadShops();
  }

  actionShops() {
    this.subscriptions.push(
      this.actionService.pipe(ofType(erreurShops)).subscribe(({messages}) => {
        this.messages$.next(
          {type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER}, title: APP_COLORS.DANGER, message: messages, dismissible: false}
        );
      }),
      this.actionService.pipe(ofType(addShop)).subscribe(() => {
        this.messages$.next(
          {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: this.translateService.instant('MESSAGES.SUCCESS_ACTION.SHOP_CREATE'), dismissible: false}
        );
        setTimeout(() => {
          this.loadShops();
        }, 1000);
      }),
      this.actionService.pipe(ofType(loadShops)).subscribe(() => {
      })
    );
  }

  loadShops() {
    if (!this.workspaceId) {
      console.error('Cannot load shops: workspaceId is required');
      return;
    }
    const filters: ShopListRequestDto = {
      search: this.searchTerm || undefined,
      isActive: this.isActiveFilter !== null ? this.isActiveFilter : undefined,
      page: this.currentPage,
      size: this.pageSize,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection
    };
    this.storeService.dispatch(findAllShops({ workspaceId: this.workspaceId, filters }));
  }

  onSearchChange(): void {
    this.currentPage = 0;
    this.loadShops();
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadShops();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.isActiveFilter = null;
    this.currentPage = 0;
    this.loadShops();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadShops();
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.loadShops();
  }

  getPageNumbers(state: ShopState): number[] {
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
    this.modalRef = this.modalService.show(CreateShopComponent, { 
      class: 'modal-lg',
      backdrop: true,
      ignoreBackdropClick: true
    });
  }

  onView(shop: ShopResponseDto): void {
    if (shop.id) {
      // Passer le workspaceId dans les query params pour le composant detail
      const workspaceId = shop.workspaceId || this.workspaceId;
      if (workspaceId) {
        this.router.navigate(['/admin/shops/detail', shop.id], {
          queryParams: { workspaceId: workspaceId }
        });
      } else {
        console.error('Cannot view shop: workspaceId is required');
        this.messages$.next({
          type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER},
          title: APP_COLORS.DANGER,
          message: this.translateService.instant('MESSAGES.ADMIN.SHOP.WORKSPACE_ID_REQUIRED'),
          dismissible: true
        });
      }
    }
  }

  onEdit(shop: ShopResponseDto): void {
    if (shop.id) {
      this.router.navigate(['/admin/shops/edit', shop.id]);
    }
  }

  onDelete(shop: ShopResponseDto): void {
    const initialState = {
      title: this.translateService.instant('MESSAGES.ADMIN.SHOP.DELETE_TITLE'),
      message: this.translateService.instant('MESSAGES.ADMIN.SHOP.DELETE_MESSAGE'),
      itemName: shop.name,
      confirmBtnText: this.translateService.instant('MESSAGES.ADMIN.SHOP.DELETE_BUTTON'),
      cancelBtnText: this.translateService.instant('MESSAGES.ADMIN.SHOP.CANCEL')
    };
    
    this.modalRef = this.modalService.show(DeleteConfirmModalComponent, {
      initialState,
      class: 'modal-dialog-centered'
    });
    
    if (this.modalRef.content) {
      this.modalRef.content.onConfirm.subscribe((confirmed: boolean) => {
        if (confirmed && this.workspaceId) {
          this.storeService.dispatch(deleteShop({ workspaceId: this.workspaceId, shopId: shop.id }));
          setTimeout(() => {
            this.loadShops();
          }, 1000);
        }
      });
    }
  }

  onReactivate(shop: ShopResponseDto): void {
    if (!this.workspaceId) {
      console.error('Cannot reactivate shop: workspaceId is required');
      return;
    }
    this.storeService.dispatch(reactivateShop({ workspaceId: this.workspaceId, shopId: shop.id }));
    setTimeout(() => {
      this.loadShops();
    }, 1000);
  }

  /**
   * Export shops to CSV
   */
  onExportShops(): void {
    if (!this.workspaceId) {
      console.error('Cannot export shops: workspaceId is required');
      this.messages$.next({
        type: { icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER },
        title: APP_COLORS.DANGER,
        message: this.translateService.instant('MESSAGES.ERRORS.EXPORT'),
        dismissible: true
      });
      return;
    }

    this.shopService.exportShops(this.workspaceId).subscribe({
      next: (blob: Blob) => {
        // Créer un lien de téléchargement
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `shops_${this.workspaceId}_${new Date().getTime()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        this.messages$.next({
          type: { icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS },
          title: APP_COLORS.SUCCESS,
          message: this.translateService.instant('MESSAGES.SUCCESS_ACTION.SHOP_EXPORT'),
          dismissible: true
        });
      },
      error: (error) => {
        console.error('Error exporting shops:', error);
        this.messages$.next({
          type: { icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER },
          title: APP_COLORS.DANGER,
          message: error?.error?.message || this.translateService.instant('MESSAGES.ERRORS.EXPORT'),
          dismissible: true
        });
      }
    });
  }

  /**
   * Import shops from CSV
   */
  onImportShops(event: any): void {
    if (!this.workspaceId) {
      console.error('Cannot import shops: workspaceId is required');
      this.messages$.next({
        type: { icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER },
        title: APP_COLORS.DANGER,
        message: this.translateService.instant('MESSAGES.ERRORS.IMPORT'),
        dismissible: true
      });
      return;
    }

    const file = event.target.files[0];
    if (!file) {
      return;
    }

    // Vérifier que c'est un fichier CSV
    if (!file.name.endsWith('.csv')) {
      this.messages$.next({
        type: { icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER },
        title: APP_COLORS.DANGER,
        message: this.translateService.instant('MESSAGES.ERRORS.INVALID_FILE_TYPE'),
        dismissible: true
      });
      event.target.value = '';
      return;
    }

    this.shopService.importShops(this.workspaceId, file).subscribe({
      next: (result) => {
        if (result.status === 'SUCCESS') {
          this.messages$.next({
            type: { icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS },
            title: APP_COLORS.SUCCESS,
            message: this.translateService.instant('MESSAGES.SUCCESS_ACTION.SHOP_IMPORT'),
            dismissible: true
          });
          // Recharger les shops après import
          setTimeout(() => {
            this.loadShops();
          }, 1000);
        } else {
          this.messages$.next({
            type: { icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER },
            title: APP_COLORS.DANGER,
            message: result.message || this.translateService.instant('MESSAGES.ERRORS.IMPORT'),
            dismissible: true
          });
        }
        // Réinitialiser l'input file
        event.target.value = '';
      },
      error: (error) => {
        console.error('Error importing shops:', error);
        this.messages$.next({
          type: { icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER },
          title: APP_COLORS.DANGER,
          message: error?.error?.message || this.translateService.instant('MESSAGES.ERRORS.IMPORT'),
          dismissible: true
        });
        event.target.value = '';
      }
    });
  }
}

