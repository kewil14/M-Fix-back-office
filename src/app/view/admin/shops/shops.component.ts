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
  
  // Données complètes chargées une fois
  allShops: ShopResponseDto[] = [];
  filteredShops: ShopResponseDto[] = [];
  displayedShops: ShopResponseDto[] = [];

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
    
    // S'abonner au state pour récupérer toutes les données
    this.subscriptions.push(
      this.shopState$.subscribe(state => {
        if (state.dataState === DataStateEnum.SUCCESS && state.shops) {
          // Stocker toutes les données une fois chargées
          if (this.allShops.length === 0 || state.shops.length > this.allShops.length) {
            this.allShops = [...state.shops];
          }
          this.applyFilters();
        }
      })
    );
    
    // Si super admin et pas de workspaceId, charger la liste des workspaces
    if (this.isSuperAdmin && !this.workspaceId) {
      this.loadWorkspacesForSuperAdmin();
    } else if (this.workspaceId) {
      // Workspace admin ou workspaceId trouvé, charger directement les shops
      this.loadAllShops();
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
          this.loadAllShops();
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
    this.allShops = [];
    this.loadAllShops();
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
          this.loadAllShops();
        }, 1000);
      }),
      this.actionService.pipe(ofType(loadShops)).subscribe(() => {
      })
    );
  }

  // Charger toutes les données une seule fois au début
  loadAllShops() {
    if (!this.workspaceId) {
      console.error('Cannot load shops: workspaceId is required');
      return;
    }
    const filters: ShopListRequestDto = {
      page: 0,
      size: 10000, // Charger beaucoup de données
      sortBy: this.sortBy,
      sortDirection: this.sortDirection
    };
    this.storeService.dispatch(findAllShops({ workspaceId: this.workspaceId, filters }));
  }

  // Appliquer les filtres localement sans recharger
  applyFilters(): void {
    let filtered = [...this.allShops];
    
    // Filtre par recherche
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(shop => 
        (shop.name || '').toLowerCase().includes(term) ||
        (shop.email || '').toLowerCase().includes(term) ||
        (shop.city || '').toLowerCase().includes(term) ||
        (shop.workspaceName || '').toLowerCase().includes(term) ||
        (shop.managerName || '').toLowerCase().includes(term)
      );
    }
    
    // Filtre par statut actif
    if (this.isActiveFilter !== null) {
      filtered = filtered.filter(shop => shop.isActive === this.isActiveFilter);
    }
    
    // Trier
    filtered = this.sortData(filtered);
    
    this.filteredShops = filtered;
    this.applyPagination();
  }

  // Trier les données
  sortData(data: ShopResponseDto[]): ShopResponseDto[] {
    return [...data].sort((a, b) => {
      let aVal: any = a[this.sortBy as keyof ShopResponseDto];
      let bVal: any = b[this.sortBy as keyof ShopResponseDto];
      
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
    this.displayedShops = this.filteredShops.slice(startIndex, endIndex);
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
    this.applyPagination();
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.applyPagination();
  }

  getPageNumbers(): number[] {
    const totalPages = Math.ceil(this.filteredShops.length / this.pageSize);
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
    return this.filteredShops.length;
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredShops.length / this.pageSize);
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
            this.loadAllShops();
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
      this.loadAllShops();
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
            this.loadAllShops();
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

