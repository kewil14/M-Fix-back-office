import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService, ProductDetail, ProductListItem, ProductSearchParams } from 'src/app/core/shared/services/product.service';
import { ShopService } from 'src/app/core/shared/services/shop.service';
import { PermissionService } from 'src/app/core/shared/services/permission.service';
import { WorkspaceService, WorkspaceDto } from 'src/app/core/shared/services/workspace.service';
import { ShopResponseDto } from 'src/app/core/shared/dtos/shop-response-dto';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-product-stock',
  templateUrl: './product-stock.component.html',
  styleUrls: ['./product-stock.component.scss']
})
export class ProductStockComponent implements OnInit {

  loading = false;
  successMsg: string | null = null;
  errorMsg: string | null = null;

  // Données communes
  products: ProductListItem[] = [];
  productSearch: string = '';
  variants: any[] = [];
  shops: ShopResponseDto[] = [];
  workspaces$: Observable<WorkspaceDto[]> = of([]);
  selectedWorkspaceId: string = '';
  showWorkspaceSelectionMessage: boolean = false;

  // Update Stock Modal
  modalRef?: BsModalRef;
  updateSelectedProductId: string = '';
  updateSelectedVariantId: string = '';
  updateSelectedShopId: string = '';
  updateQuantity: number | null = null;
  updateType: string = 'ADJUSTMENT';
  updateNote: string = '';
  currentStock: any = null; // Stock actuel en cours de modification

  // Liste Stock
  stockList: any[] = [];
  listShopFilter: string = '';
  listCurrentPage: number = 1;
  listPageSize: number = 20;
  listTotalItems: number = 0;
  listLoading: boolean = false;

  constructor(
    private productService: ProductService,
    private shopService: ShopService,
    public permissionService: PermissionService,
    private workspaceService: WorkspaceService,
    private modalService: BsModalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadWorkspaces();
    
    // Déterminer si le message de sélection de workspace doit être affiché
    if (this.permissionService.isSuperAdmin() || this.permissionService.isAdmin()) {
      this.showWorkspaceSelectionMessage = true;
    }

    // Pour WORKSPACE_ADMIN, charger les données après que le workspace soit défini
    if (!this.permissionService.isSuperAdmin() && !this.permissionService.isAdmin()) {
      const tokenWorkspaceId = this.permissionService.getWorkspaceId();
      if (tokenWorkspaceId) {
        this.selectedWorkspaceId = tokenWorkspaceId;
        this.loadProducts();
        this.loadShopsForWorkspace();
        this.loadStockList();
      }
    }
  }

  loadWorkspaces(): void {
    // Pour SuperAdmin/Admin: charger tous les workspaces
    if (this.permissionService.isSuperAdmin() || this.permissionService.isAdmin()) {
      this.workspaces$ = this.workspaceService.getWorkspaces({ page: 0, size: 1000, isActive: true }).pipe(
        map(response => {
          if (response.status === 'SUCCESS' && response.data?.content) {
            return response.data.content.map((ws: any) => ({
              id: ws.id,
              name: ws.name,
              adminName: undefined
            }));
          }
          return [];
        })
      );
      // Ne pas pré-sélectionner, laisser l'utilisateur choisir
      this.selectedWorkspaceId = '';
    } else {
      // Pour WorkspaceAdmin ou ShopManager: charger uniquement leur workspace depuis le token
      const tokenWorkspaceId = this.permissionService.getWorkspaceId();
      if (tokenWorkspaceId) {
        this.selectedWorkspaceId = tokenWorkspaceId;
        this.workspaces$ = this.workspaceService.getWorkspaceById(tokenWorkspaceId).pipe(
          map(response => {
            if (response.status === 'SUCCESS' && response.data) {
              return [{
                id: response.data.id,
                name: response.data.name,
                adminName: undefined
              }];
            }
            return [];
          })
        );
        // Charger les boutiques et produits immédiatement pour WORKSPACE_ADMIN
        this.loadShopsForWorkspace();
        this.loadProducts();
      } else {
        this.workspaces$ = of([]);
      }
    }
  }

  loadShopsForWorkspace(): void {
    this.shops = []; // Clear shops when workspace changes
    
    // Pour WORKSPACE_ADMIN, utiliser le workspaceId du token si selectedWorkspaceId n'est pas défini
    let workspaceId = this.selectedWorkspaceId;
    if (!workspaceId && this.permissionService.isWorkspaceAdmin()) {
      workspaceId = this.permissionService.getWorkspaceId() || undefined;
    }
    
    if (!workspaceId) return;
    
    this.shopService.getShopsByWorkspace(workspaceId).subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS' && Array.isArray(res.data)) {
          this.shops = res.data;
          console.log('[ProductStockComponent] Shops loaded:', this.shops.length);
        } else {
          console.warn('[ProductStockComponent] No shops found or invalid response:', res);
        }
      },
      error: (err) => {
        console.error('[ProductStockComponent] Error loading shops:', err);
        this.errorMsg = 'Erreur lors du chargement des boutiques.';
      }
    });
  }

  loadProducts(): void {
    // Si l'utilisateur est SuperAdmin/Admin et qu'aucun workspace n'est sélectionné, ne pas charger les produits
    if ((this.permissionService.isSuperAdmin() || this.permissionService.isAdmin()) && !this.selectedWorkspaceId) {
      this.products = [];
      return;
    }

    // Pour WORKSPACE_ADMIN, utiliser le workspaceId du token si selectedWorkspaceId n'est pas défini
    let workspaceId = this.selectedWorkspaceId;
    if (!workspaceId && this.permissionService.isWorkspaceAdmin()) {
      workspaceId = this.permissionService.getWorkspaceId() || undefined;
    }

    const params: ProductSearchParams = {
      q: this.productSearch || undefined,
      state: 'ACTIVE',
      page: 1,
      page_size: 50,
      workspace_id: workspaceId || undefined
    };
    this.productService.getProducts(params).subscribe({
      next: (res) => {
        this.products = res.data || [];
      },
      error: (err) => {
        console.error('[ProductStockComponent] Error loading products:', err);
        this.errorMsg = 'Erreur lors du chargement des produits.';
      }
    });
  }

  loadVariantsForProduct(productId: string): void {
    if (!productId) {
      this.variants = [];
      return;
    }
    this.loading = true;
    this.productService.getVariantsForProduct(productId).subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS') {
          this.variants = res.data || [];
        } else {
          // Fallback: essayer avec getProductById
          this.productService.getProductById(productId).subscribe({
            next: (productRes) => {
              if (productRes && productRes.status === 'SUCCESS') {
                const p: ProductDetail = productRes.data as ProductDetail;
                this.variants = p.variants || [];
              }
              this.loading = false;
            },
            error: () => {
              this.loading = false;
            }
          });
          return;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onProductChange(productId: string): void {
    if (productId) {
      this.loadVariantsForProduct(productId);
      this.updateSelectedVariantId = ''; // Reset variant when product changes
    } else {
      this.variants = [];
      this.updateSelectedVariantId = '';
    }
  }

  // Liste Stock
  loadStockList(): void {
    // Si l'utilisateur est SuperAdmin/Admin et qu'aucun workspace n'est sélectionné, ne pas charger la liste de stock
    if ((this.permissionService.isSuperAdmin() || this.permissionService.isAdmin()) && !this.selectedWorkspaceId) {
      this.stockList = [];
      this.listTotalItems = 0;
      this.showWorkspaceSelectionMessage = true;
      this.listLoading = false;
      return;
    }
    this.showWorkspaceSelectionMessage = false;

    this.listLoading = true;
    this.errorMsg = null;

    // Pour WORKSPACE_ADMIN, utiliser le workspaceId du token si selectedWorkspaceId n'est pas défini
    let workspaceId = this.selectedWorkspaceId;
    if (!workspaceId && this.permissionService.isWorkspaceAdmin()) {
      workspaceId = this.permissionService.getWorkspaceId() || undefined;
    }

    const params: any = {
      page: this.listCurrentPage,
      page_size: this.listPageSize,
      workspace_id: workspaceId || undefined
    };

    if (this.listShopFilter) {
      params.shop_id = this.listShopFilter;
    }

    this.productService.getStockList(params).subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS') {
          if (Array.isArray(res.data)) {
            this.stockList = res.data;
            this.listTotalItems = res.data.length;
          } else if (res.data?.content) {
            this.stockList = res.data.content;
            this.listTotalItems = res.data.totalElements || res.data.content.length;
          } else if (res.data?.data) {
            this.stockList = Array.isArray(res.data.data) ? res.data.data : [];
            this.listTotalItems = res.data.total || this.stockList.length;
          } else {
            this.stockList = [];
            this.listTotalItems = 0;
          }
        } else {
          this.errorMsg = res?.message || 'Impossible de charger la liste du stock.';
          this.stockList = [];
        }
        this.listLoading = false;
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Erreur lors du chargement de la liste du stock.';
        this.listLoading = false;
        this.stockList = [];
      }
    });
  }

  onWorkspaceChange(): void {
    console.log('[ProductStockComponent] Workspace changed, loading data for workspaceId:', this.selectedWorkspaceId);
    this.listCurrentPage = 1;
    this.showWorkspaceSelectionMessage = false;
    this.loadStockList();
    this.loadProducts();
    this.loadShopsForWorkspace();
  }

  onListFilterChange(): void {
    this.listCurrentPage = 1;
    this.loadStockList();
  }

  onListPageChange(page: number): void {
    this.listCurrentPage = page;
    this.loadStockList();
  }

  onListPageSizeChange(size: number): void {
    this.listPageSize = size;
    this.listCurrentPage = 1;
    this.loadStockList();
  }

  getListTotalPages(): number {
    return Math.ceil(this.listTotalItems / this.listPageSize);
  }

  getListPageNumbers(): number[] {
    const total = this.getListTotalPages();
    const pages: number[] = [];
    const maxPages = 5;
    let start = Math.max(1, this.listCurrentPage - Math.floor(maxPages / 2));
    let end = Math.min(total, start + maxPages - 1);
    if (end - start < maxPages - 1) {
      start = Math.max(1, end - maxPages + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Actions sur les stocks dans la liste
  onViewStock(stock: any): void {
    const variantId = stock.product_variant_id || stock.variant_id;
    const shopId = this.getStockShopId(stock);
    
    if (!variantId || !shopId) {
      this.errorMsg = 'Impossible de déterminer le variant ou la boutique.';
      return;
    }
    
    // Rediriger vers la page de détail
    this.router.navigate(['/admin/product-stock/detail', variantId, shopId]);
  }

  openUpdateModal(template: TemplateRef<any>, stock: any): void {
    // Pré-remplir le formulaire avec les données du stock
    const variantId = stock.product_variant_id || stock.variant_id;
    const shopId = this.getStockShopId(stock);
    const productId = stock.product_id || stock.productId;
    
    this.currentStock = stock;
    this.updateSelectedVariantId = variantId;
    this.updateSelectedShopId = shopId;
    this.updateQuantity = stock.quantity || 0;
    this.updateType = 'ADJUSTMENT';
    this.updateNote = '';
    
    // Si on a un productId, charger le produit et ses variants
    if (productId) {
      this.updateSelectedProductId = productId;
      this.loadVariantsForProduct(productId);
    } else {
      this.updateSelectedProductId = '';
      this.variants = [];
    }
    
    // S'assurer que le workspace est sélectionné
    if (!this.selectedWorkspaceId) {
      const tokenWorkspaceId = this.permissionService.getWorkspaceId();
      if (tokenWorkspaceId) {
        this.selectedWorkspaceId = tokenWorkspaceId;
      }
    }
    
    // Charger les produits et boutiques si nécessaire
    if (this.products.length === 0) {
      this.loadProducts();
    }
    if (this.shops.length === 0) {
      this.loadShopsForWorkspace();
    }
    
    this.modalRef = this.modalService.show(template, {
      class: 'modal-lg',
      backdrop: 'static'
    });
  }

  onUpdateStock(): void {
    this.successMsg = null;
    this.errorMsg = null;

    if (!this.updateSelectedVariantId || this.updateQuantity === null || !this.updateSelectedShopId) {
      this.errorMsg = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    this.loading = true;
    const body = {
      quantity: this.updateQuantity,
      type: this.updateType,
      note: this.updateNote || undefined
    };

    this.productService.updateStock(this.updateSelectedVariantId, this.updateSelectedShopId, body).subscribe({
      next: () => {
        this.successMsg = 'Stock mis à jour avec succès.';
        this.loading = false;
        this.resetUpdateForm();
        this.modalRef?.hide();
        // Rafraîchir la liste
        this.loadStockList();
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Erreur lors de la mise à jour du stock.';
        this.loading = false;
      }
    });
  }

  resetUpdateForm(): void {
    this.updateSelectedProductId = '';
    this.updateSelectedVariantId = '';
    this.updateSelectedShopId = '';
    this.updateQuantity = null;
    this.updateType = 'ADJUSTMENT';
    this.updateNote = '';
    this.variants = [];
    this.currentStock = null;
  }

  // Exposer Math pour le template
  Math = Math;

  // Helper pour trouver un shop par ID
  findShopById(shopId: string): ShopResponseDto | undefined {
    if (!shopId) return undefined;
    return this.shops.find(s => s.id === shopId);
  }

  // Helper pour obtenir le shop_id d'un stock
  getStockShopId(stock: any): string {
    return stock.shop_id || stock.shopId || '';
  }

  // Helper pour obtenir la quantité disponible
  getAvailableQuantity(stock: any): number {
    return stock.available_quantity || stock.availableQuantity || 0;
  }

  // Helper pour obtenir le seuil d'alerte
  getAlertThreshold(stock: any): number {
    return stock.alert_threshold || stock.alertThreshold || 0;
  }

  // Helper pour vérifier si le stock est en alerte
  isStockLow(stock: any): boolean {
    return this.getAvailableQuantity(stock) <= this.getAlertThreshold(stock);
  }
}
