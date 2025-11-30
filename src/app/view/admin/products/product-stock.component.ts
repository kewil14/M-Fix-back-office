import { Component, OnInit } from '@angular/core';
import { ProductService, ProductDetail, ProductListItem, ProductSearchParams } from 'src/app/core/shared/services/product.service';
import { ShopService } from 'src/app/core/shared/services/shop.service';
import { PermissionService } from 'src/app/core/shared/services/permission.service';
import { WorkspaceService, WorkspaceDto } from 'src/app/core/shared/services/workspace.service';
import { ShopResponseDto } from 'src/app/core/shared/dtos/shop-response-dto';

@Component({
  selector: 'app-product-stock',
  templateUrl: './product-stock.component.html',
  styleUrls: ['./product-stock.component.scss']
})
export class ProductStockComponent implements OnInit {

  loading = false;
  successMsg: string | null = null;
  errorMsg: string | null = null;

  // Onglet actif
  activeTab: 'list' | 'update' | 'reserve' | 'sync' | 'check' = 'list';

  // Données communes
  products: ProductListItem[] = [];
  productSearch: string = '';
  variants: any[] = [];
  shops: ShopResponseDto[] = [];
  workspaces: WorkspaceDto[] = [];
  workspaceId: string = '';

  // Update Stock
  updateSelectedProductId: string = '';
  updateSelectedVariantId: string = '';
  updateSelectedShopId: string = '';
  updateQuantity: number | null = null;
  updateType: string = 'ADJUSTMENT';
  updateNote: string = '';

  // Reserve Stock
  reserveItems: Array<{ variant_id: string; quantity: number; shop_id: string }> = [];
  reserveProductId: string = '';
  reserveVariantId: string = '';
  reserveShopId: string = '';
  reserveQuantity: number | null = null;

  // Sync Stock
  syncProductId: string = '';
  syncVariantId: string = '';
  syncSourceShopId: string = '';
  syncQuantity: number | null = null;
  syncTargetShopIds: string[] = [];

  // Check Stock
  checkItems: Array<{ variant_id: string; shop_id: string; quantity: number }> = [];
  checkProductId: string = '';
  checkVariantId: string = '';
  checkShopId: string = '';
  checkQuantity: number | null = null;
  checkResult: any = null;

  // Liste Stock
  stockList: any[] = [];
  listShopFilter: string = '';
  listVariantFilter: string = '';
  listProductFilter: string = '';
  listCurrentPage: number = 1;
  listPageSize: number = 20;
  listTotalItems: number = 0;
  listLoading: boolean = false;

  constructor(
    private productService: ProductService,
    private shopService: ShopService,
    private permissionService: PermissionService,
    private workspaceService: WorkspaceService
  ) {}

  ngOnInit(): void {
    this.loadWorkspaces();
    this.loadProducts();
    if (this.activeTab === 'list') {
      this.loadStockList();
    }
  }

  loadWorkspaces(): void {
    this.workspaceService.findAllWorkspaces().subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS' && Array.isArray(res.data)) {
          this.workspaces = res.data;
          const tokenWorkspaceId = this.permissionService.getWorkspaceId();
          if (tokenWorkspaceId && this.workspaces.some(w => w.id === tokenWorkspaceId)) {
            this.workspaceId = tokenWorkspaceId;
            this.loadShopsForWorkspace();
          }
        }
      }
    });
  }

  loadShopsForWorkspace(): void {
    if (!this.workspaceId) return;
    this.shopService.getShopsByWorkspace(this.workspaceId).subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS' && Array.isArray(res.data)) {
          this.shops = res.data;
        }
      }
    });
  }

  loadProducts(): void {
    const params: ProductSearchParams = {
      q: this.productSearch || undefined,
      state: 'ACTIVE',
      page: 1,
      page_size: 50
    };
    this.productService.getProducts(params).subscribe({
      next: (res) => {
        this.products = res.data || [];
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

  // Update Stock
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
        // Rafraîchir la liste si on est sur l'onglet liste
        if (this.activeTab === 'list') {
          this.loadStockList();
        }
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
  }

  // Reserve Stock
  addReserveItem(): void {
    if (!this.reserveVariantId || this.reserveQuantity === null || !this.reserveShopId) {
      this.errorMsg = 'Veuillez remplir tous les champs pour ajouter un item.';
      return;
    }

    this.reserveItems.push({
      variant_id: this.reserveVariantId,
      quantity: this.reserveQuantity,
      shop_id: this.reserveShopId
    });

    this.reserveVariantId = '';
    this.reserveQuantity = null;
    this.reserveShopId = '';
    this.reserveProductId = '';
    this.variants = [];
  }

  removeReserveItem(index: number): void {
    this.reserveItems.splice(index, 1);
  }

  onReserveStock(): void {
    if (this.reserveItems.length === 0) {
      this.errorMsg = 'Veuillez ajouter au moins un item à réserver.';
      return;
    }

    this.loading = true;
    this.productService.reserveStock(this.reserveItems).subscribe({
      next: () => {
        this.successMsg = 'Stock réservé avec succès.';
        this.loading = false;
        this.reserveItems = [];
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Erreur lors de la réservation du stock.';
        this.loading = false;
      }
    });
  }


  // Sync Stock
  onSyncStock(): void {
    if (!this.syncVariantId || !this.syncSourceShopId || this.syncQuantity === null || this.syncTargetShopIds.length === 0) {
      this.errorMsg = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    this.loading = true;
    this.productService.syncStock(this.syncVariantId, this.syncSourceShopId, this.syncQuantity, this.syncTargetShopIds).subscribe({
      next: () => {
        this.successMsg = 'Stock synchronisé avec succès.';
        this.loading = false;
        this.resetSyncForm();
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Erreur lors de la synchronisation du stock.';
        this.loading = false;
      }
    });
  }

  resetSyncForm(): void {
    this.syncProductId = '';
    this.syncVariantId = '';
    this.syncSourceShopId = '';
    this.syncQuantity = null;
    this.syncTargetShopIds = [];
    this.variants = [];
  }

  toggleSyncTargetShop(shopId: string): void {
    const index = this.syncTargetShopIds.indexOf(shopId);
    if (index > -1) {
      this.syncTargetShopIds.splice(index, 1);
    } else {
      this.syncTargetShopIds.push(shopId);
    }
  }

  // Check Stock
  addCheckItem(): void {
    if (!this.checkVariantId || this.checkQuantity === null || !this.checkShopId) {
      this.errorMsg = 'Veuillez remplir tous les champs pour ajouter un item.';
      return;
    }

    this.checkItems.push({
      variant_id: this.checkVariantId,
      shop_id: this.checkShopId,
      quantity: this.checkQuantity
    });

    this.checkVariantId = '';
    this.checkQuantity = null;
    this.checkShopId = '';
    this.checkProductId = '';
    this.variants = [];
  }

  removeCheckItem(index: number): void {
    this.checkItems.splice(index, 1);
  }

  onCheckStock(): void {
    if (this.checkItems.length === 0) {
      this.errorMsg = 'Veuillez ajouter au moins un item à vérifier.';
      return;
    }

    this.loading = true;
    this.productService.checkStock(this.checkItems).subscribe({
      next: (res) => {
        this.checkResult = res?.data || res;
        this.successMsg = 'Vérification du stock effectuée.';
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Erreur lors de la vérification du stock.';
        this.loading = false;
      }
    });
  }

  onProductChange(productId: string, context: string): void {
    if (productId) {
      this.loadVariantsForProduct(productId);
    } else {
      this.variants = [];
    }
  }

  // Liste Stock
  loadStockList(): void {
    this.listLoading = true;
    this.errorMsg = null;

    const params: any = {
      page: this.listCurrentPage,
      page_size: this.listPageSize
    };

    if (this.listShopFilter) {
      params.shop_id = this.listShopFilter;
    }

    if (this.listVariantFilter) {
      params.variant_id = this.listVariantFilter;
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
