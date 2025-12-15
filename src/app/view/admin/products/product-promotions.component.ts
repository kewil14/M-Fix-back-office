import { Component, OnInit } from '@angular/core';
import { ProductService, ProductListItem, CategoryTreeItem } from 'src/app/core/shared/services/product.service';
import { WorkspaceService, WorkspaceDto } from 'src/app/core/shared/services/workspace.service';
import { PermissionService } from 'src/app/core/shared/services/permission.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-product-promotions',
  templateUrl: './product-promotions.component.html',
  styleUrls: ['./product-promotions.component.scss']
})
export class ProductPromotionsComponent implements OnInit {

  loading = false;
  successMsg: string | null = null;
  errorMsg: string | null = null;

  // Workspace selection
  workspaces$: Observable<WorkspaceDto[]> = of([]);
  selectedWorkspaceId: string = '';
  showWorkspaceSelectionMessage: boolean = false;

  name = '';
  description = '';
  type: 'PERCENTAGE' | 'FIXED' = 'PERCENTAGE';
  value: number | null = null;
  startDate = '';
  endDate = '';
  minQuantity: number | null = null;
  maxUses: number | null = null;

  products: ProductListItem[] = [];
  categoriesFlat: { id: string; labelPath: string }[] = [];
  selectedProductIds: string[] = [];
  selectedCategoryIds: string[] = [];

  constructor(
    private productService: ProductService,
    private workspaceService: WorkspaceService,
    public permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.loadWorkspaces();
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

    if (this.permissionService.isSuperAdmin() || this.permissionService.isAdmin()) {
      this.showWorkspaceSelectionMessage = true;
    } else {
      const tokenWorkspaceId = this.permissionService.getWorkspaceId();
      if (tokenWorkspaceId) {
        this.selectedWorkspaceId = tokenWorkspaceId;
        this.onWorkspaceChange(); // Load data for the workspace
      } else {
        this.showWorkspaceSelectionMessage = true;
      }
    }
  }

  onWorkspaceChange(): void {
    if (this.selectedWorkspaceId) {
      this.showWorkspaceSelectionMessage = false;
      this.loadProductsAndCategories();
    } else {
      this.products = [];
      this.categoriesFlat = [];
    }
  }

  private loadProductsAndCategories(): void {
    if (!this.selectedWorkspaceId) return;

    const params = { workspace_id: this.selectedWorkspaceId, page_size: 1000, state: 'ACTIVE' };

    this.productService.getProducts(params).subscribe({
      next: (res) => {
        if (res && res.success && Array.isArray(res.data)) {
          this.products = res.data;
        } else if (res && res.data) {
          this.products = res.data;
        }
      },
      error: () => { /* silent */ }
    });

    this.productService.getCategoriesTree().subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS' && Array.isArray(res.data)) {
          this.categoriesFlat = this.flattenCategories(res.data);
        }
      },
      error: () => { /* silent */ }
    });
  }

  private flattenCategories(categories: CategoryTreeItem[], parentPath: string = ''): { id: string; labelPath: string }[] {
    const result: { id: string; labelPath: string }[] = [];
    for (const cat of categories) {
      const currentPath = parentPath ? `${parentPath} / ${cat.label}` : cat.label;
      result.push({ id: cat.id, labelPath: currentPath });
      if (cat.subcategories && cat.subcategories.length) {
        result.push(...this.flattenCategories(cat.subcategories, currentPath));
      }
    }
    return result;
  }

  onSubmit(): void {
    this.successMsg = null;
    this.errorMsg = null;

    if (!this.selectedWorkspaceId) {
      this.errorMsg = 'Veuillez sélectionner un workspace.';
      return;
    }
    if (!this.name || this.value === null || !this.startDate || !this.endDate) {
      this.errorMsg = 'Veuillez renseigner au minimum le nom, la valeur et la période de la promotion.';
      return;
    }
    if (this.selectedProductIds.length === 0 && this.selectedCategoryIds.length === 0) {
      this.errorMsg = 'Veuillez cibler au moins un produit ou une catégorie.';
      return;
    }

    this.loading = true;

    const body: any = {
      name: this.name,
      description: this.description || undefined,
      type: this.type,
      value: this.value,
      start_date: this.startDate,
      end_date: this.endDate,
      product_ids: this.selectedProductIds.length ? this.selectedProductIds : undefined,
      category_ids: this.selectedCategoryIds.length ? this.selectedCategoryIds : undefined,
      min_quantity: this.minQuantity ?? undefined,
      max_uses: this.maxUses ?? undefined,
      workspace_id: this.selectedWorkspaceId,
    };

    this.productService.createPromotion(body).subscribe({
      next: () => {
        this.successMsg = 'Promotion créée avec succès.';
        this.loading = false;
        this.resetForm();
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Erreur lors de la création de la promotion.';
        this.loading = false;
      }
    });
  }

  private resetForm(): void {
    this.name = '';
    this.description = '';
    this.value = null;
    this.startDate = '';
    this.endDate = '';
    this.minQuantity = null;
    this.maxUses = null;
    this.selectedProductIds = [];
    this.selectedCategoryIds = [];
  }
}


