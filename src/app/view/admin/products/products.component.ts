import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription, of } from 'rxjs';
import { ProductService, ProductListItem, ProductSearchParams } from 'src/app/core/shared/services/product.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DeleteConfirmModalComponent } from 'src/app/shared-module/components/delete-confirm-modal/delete-confirm-modal.component';
import { DuplicateProductModalComponent, DuplicateProductOptions } from 'src/app/shared-module/components/duplicate-product-modal/duplicate-product-modal.component';
import { PermissionService } from 'src/app/core/shared/services/permission.service';
import { WorkspaceService, WorkspaceDto } from 'src/app/core/shared/services/workspace.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-admin-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class AdminProductsComponent implements OnInit, OnDestroy {
  breadCrumbItems!: Array<{}>;

  products: ProductListItem[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  showWorkspaceSelectionMessage: boolean = false; // Nouveau

  // Filtres
  searchTerm: string = '';
  stateFilter: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | 'DELETED' | 'ALL' = 'ACTIVE';
  inStockOnly: boolean | null = null;
  categoryId: string = '';
  brandId: string = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  isFeatured: boolean | null = null;
  sortBy: string = 'created_at';
  sortOrder: 'asc' | 'desc' = 'desc';
  filtersExpanded: boolean = false;
  selectedWorkspaceId: string = ''; // Nouveau filtre workspace

  // Données pour les filtres
  brands: any[] = [];
  categoriesFlat: { id: string; labelPath: string }[] = [];
  workspaces$: Observable<WorkspaceDto[]> = of([]); // Liste des workspaces

  // Pagination
  page: number = 1;
  pageSize: number = 20;
  total: number = 0;

  private subscriptions: Subscription[] = [];
  modalRef?: BsModalRef;

  constructor(
    private productService: ProductService,
    private modalService: BsModalService,
    public permissionService: PermissionService, // Public pour l'utiliser dans le template
    private workspaceService: WorkspaceService // Injecter le service Workspace
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Admin' }, { label: 'Produits', active: true }];
    this.loadBrandsAndCategories();
    this.loadWorkspaces(); // Charger les workspaces

    // Déterminer si le message de sélection de workspace doit être affiché
    if (this.permissionService.isSuperAdmin() || this.permissionService.isAdmin()) {
      this.showWorkspaceSelectionMessage = true;
    }
    
    this.loadProducts();
  }

  loadBrandsAndCategories(): void {
    // Charger les marques
    this.productService.getBrands().subscribe({
      next: (res) => {
        console.log('[ProductsComponent.loadBrandsAndCategories] Brands response:', res);
        if (res && res.status === 'SUCCESS') {
          this.brands = (res.data as any[]) || [];
          console.log('[ProductsComponent.loadBrandsAndCategories] Loaded brands:', this.brands.length);
        }
      },
      error: (err) => {
        console.error('[ProductsComponent.loadBrandsAndCategories] Error loading brands:', err);
      }
    });

    // Charger les catégories
    this.productService.getCategoriesTree().subscribe({
      next: (res) => {
        console.log('[ProductsComponent.loadBrandsAndCategories] Categories response:', res);
        if (res && res.status === 'SUCCESS') {
          this.categoriesFlat = [];
          (res.data as any[] || []).forEach(cat => this.flattenCategory(cat));
          console.log('[ProductsComponent.loadBrandsAndCategories] Loaded categories:', this.categoriesFlat.length);
        }
      },
      error: (err) => {
        console.error('[ProductsComponent.loadBrandsAndCategories] Error loading categories:', err);
      }
    });
  }

  loadWorkspaces(): void {
    // Utiliser getWorkspaces pour obtenir les vrais workspaces (espaces) au lieu des workspace admins
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
  }

  private flattenCategory(cat: any, prefix: string = ''): void {
    const labelPath = prefix ? `${prefix} / ${cat.label}` : cat.label;
    this.categoriesFlat.push({ id: cat.id, labelPath });
    if (cat.subcategories && cat.subcategories.length) {
      cat.subcategories.forEach((sub: any) => this.flattenCategory(sub, labelPath));
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  loadProducts(): void {
    // Si l'utilisateur est SuperAdmin/Admin et qu'aucun workspace n'est sélectionné, ne pas charger les produits
    if ((this.permissionService.isSuperAdmin() || this.permissionService.isAdmin()) && !this.selectedWorkspaceId) {
      this.products = [];
      this.total = 0;
      this.showWorkspaceSelectionMessage = true;
      return;
    }
    this.showWorkspaceSelectionMessage = false; // Cacher le message si un workspace est sélectionné ou si l'utilisateur n'est pas SuperAdmin/Admin

    this.isLoading = true;
    this.errorMessage = null;

    const params: ProductSearchParams = {
      q: this.searchTerm?.trim() || undefined,
      category_id: this.categoryId || undefined,
      brand_id: this.brandId || undefined,
      min_price: this.minPrice || undefined,
      max_price: this.maxPrice || undefined,
      is_featured: this.isFeatured ?? undefined,
      state: this.stateFilter === 'ALL' ? undefined : this.stateFilter,
      in_stock: this.inStockOnly ?? undefined,
      sort_by: this.sortBy,
      sort_order: this.sortOrder,
      page: this.page,
      page_size: this.pageSize,
      workspace_id: this.selectedWorkspaceId || undefined // Ajouter le filtre workspace
    };

    // Si un workspace est sélectionné via le filtre, il prime sur le filtrage par rôle
    if (!this.selectedWorkspaceId) {
      if (this.permissionService.isWorkspaceAdmin()) {
        const workspaceId = this.permissionService.getWorkspaceId();
        if (workspaceId) {
          (params as any).workspace_id = workspaceId;
          console.log('[ProductsComponent] Workspace Admin - Filtering by workspace:', workspaceId);
        }
      } else if (this.permissionService.isShopManager()) {
        const shopId = this.permissionService.getShopId();
        if (shopId) {
          (params as any).shop_id = shopId;
          console.log('[ProductsComponent] Shop Manager - Filtering by shop:', shopId);
        }
      }
    } else {
      console.log('[ProductsComponent] Filtering by selected workspace:', this.selectedWorkspaceId);
    }

    console.log('[ProductsComponent.loadProducts] Request params:', params);
    const sub = this.productService.getProducts(params).subscribe({
      next: (res) => {
        console.log('[ProductsComponent.loadProducts] Response received:', res);
        this.isLoading = false;
        if (res && res.success) {
          this.products = res.data || [];
          this.total = res.total ?? this.products.length;
          console.log('[ProductsComponent.loadProducts] Loaded products:', this.products.length);
          if (this.products.length > 0) {
            console.log('[ProductsComponent.loadProducts] Sample product shop_id:', (this.products[0] as any).shop_id || 'N/A');
          }
        } else {
          this.products = [];
          this.total = 0;
          this.errorMessage = res?.message || 'Aucun produit trouvé.';
        }
      },
      error: (err) => {
        console.error('[ProductsComponent.loadProducts] Error:', err);
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Erreur lors du chargement des produits.';
        this.products = [];
        this.total = 0;
      }
    });

    this.subscriptions.push(sub);
  }

  onSearchChange(): void {
    this.page = 1;
    this.loadProducts();
  }

  onFilterChange(): void {
    this.page = 1;
    this.loadProducts();
  }

  onWorkspaceChange(): void {
    this.page = 1;
    this.showWorkspaceSelectionMessage = false; // Cacher le message dès qu'un workspace est sélectionné
    console.log('[ProductsComponent] Workspace changed, loading products for workspaceId:', this.selectedWorkspaceId);
    // Réinitialiser les filtres dépendants du workspace
    this.categoryId = '';
    this.brandId = '';
    this.loadProducts();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.stateFilter = 'ACTIVE';
    this.inStockOnly = null;
    this.categoryId = '';
    this.brandId = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.isFeatured = null;
    this.sortBy = 'created_at';
    this.sortOrder = 'desc';
    this.selectedWorkspaceId = ''; // Réinitialiser le filtre workspace
    this.page = 1;
    
    // Si l'utilisateur est SuperAdmin/Admin, réafficher le message après réinitialisation
    if (this.permissionService.isSuperAdmin() || this.permissionService.isAdmin()) {
      this.showWorkspaceSelectionMessage = true;
    }
    this.loadProducts();
  }

  onInStockChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.inStockOnly = input?.checked ? true : null;
    this.onFilterChange();
  }

  onIsFeaturedChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.isFeatured = input?.checked ? true : null;
    this.onFilterChange();
  }

  changePage(page: number): void {
    if (page < 1) return;
    this.page = page;
    this.loadProducts();
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.page = 1;
    this.loadProducts();
  }

  getVisibleEnd(): number {
    return Math.min(this.page * this.pageSize, this.total);
  }

  getTotalPages(): number {
    if (!this.pageSize) return 1;
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  onDeleteProduct(product: ProductListItem): void {
    const initialState = {
      title: 'Supprimer le produit',
      message: `Êtes-vous sûr de vouloir supprimer le produit "${product.label}" ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    };

    this.modalRef = this.modalService.show(DeleteConfirmModalComponent, { initialState });

    this.modalRef.content?.onConfirm.subscribe(() => {
      this.productService.deleteProduct(product.id).subscribe({
        next: (res) => {
          if (res && res.status === 'SUCCESS') {
            this.loadProducts();
            this.modalRef?.hide();
          } else {
            this.errorMessage = res?.message || 'Erreur lors de la suppression du produit.';
            this.modalRef?.hide();
          }
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Erreur lors de la suppression du produit.';
          this.modalRef?.hide();
        }
      });
    });
  }

  onChangeState(product: ProductListItem, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newState = select.value;
    const oldState = product.state;

    // Si le statut n'a pas changé, ne rien faire
    if (newState === oldState) {
      return;
    }

    // Demander une raison si nécessaire (optionnel)
    const reason = prompt(`Raison du changement de statut (optionnel) :`);
    
    // Sauvegarder l'ancien état pour pouvoir le restaurer en cas d'erreur
    const previousState = product.state;
    
    // Mettre à jour immédiatement l'état dans l'interface (optimistic update)
    product.state = newState;

    this.productService.updateProductState(product.id, newState, reason || undefined).subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS') {
          // Mettre à jour le produit avec les données retournées si disponibles
          if (res.data) {
            Object.assign(product, res.data);
          }
          // Recharger la liste pour s'assurer que tout est à jour
          this.loadProducts();
        } else {
          // Restaurer l'ancien état en cas d'erreur
          product.state = previousState;
          select.value = previousState;
          this.errorMessage = res?.message || 'Erreur lors du changement de statut du produit.';
        }
      },
      error: (err) => {
        // Restaurer l'ancien état en cas d'erreur
        product.state = previousState;
        select.value = previousState;
        this.errorMessage = err?.error?.message || 'Erreur lors du changement de statut du produit.';
      }
    });
  }

  onDuplicateProduct(product: ProductListItem): void {
    const initialState = {
      title: 'Dupliquer le produit',
      productLabel: product.label,
      newLabel: `${product.label} (Copie)`,
      copyStock: false,
      copyReviews: false,
      copyImages: true,
      confirmBtnText: 'Dupliquer',
      cancelBtnText: 'Annuler'
    };

    this.modalRef = this.modalService.show(DuplicateProductModalComponent, { initialState });

    this.modalRef.content?.onConfirm.subscribe((options: DuplicateProductOptions) => {
      this.productService.duplicateProduct(product.id, options).subscribe({
        next: (res) => {
          if (res && res.status === 'SUCCESS') {
            this.loadProducts();
            this.modalRef?.hide();
            // Optionnel : rediriger vers le produit dupliqué
            if (res.data && res.data.id) {
              // this.router.navigate(['/admin/products/detail', res.data.id]);
            }
          } else {
            this.errorMessage = res?.message || 'Erreur lors de la duplication du produit.';
            this.modalRef?.hide();
          }
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Erreur lors de la duplication du produit.';
          this.modalRef?.hide();
        }
      });
    });
  }

  onExportCSV(): void {
    // Préparer les paramètres d'export basés sur les filtres actuels
    const exportParams: {
      category_id?: string;
      brand_id?: string;
      state?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | 'DELETED';
      workspace_id?: string; // Ajouter le filtre workspace
    } = {};

    if (this.categoryId) {
      exportParams.category_id = this.categoryId;
    }
    if (this.brandId) {
      exportParams.brand_id = this.brandId;
    }
    if (this.stateFilter && this.stateFilter !== 'ALL') {
      exportParams.state = this.stateFilter;
    }
    if (this.selectedWorkspaceId) {
      exportParams.workspace_id = this.selectedWorkspaceId;
    }

    this.productService.exportProductsCSV(exportParams).subscribe({
      next: (blob: Blob) => {
        // Créer un lien de téléchargement
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const timestamp = new Date().getTime();
        link.download = `produits_${timestamp}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        // Message de succès (optionnel)
        // Vous pouvez utiliser un service de notification si disponible
      },
      error: (error) => {
        console.error('Erreur lors de l\'export CSV:', error);
        this.errorMessage = error?.error?.message || 'Erreur lors de l\'export des produits en CSV.';
      }
    });
  }
}




