import { Component, OnInit } from '@angular/core';
import { ProductService, ProductListItem, CategoryTreeItem } from 'src/app/core/shared/services/product.service';

@Component({
  selector: 'app-product-promotions',
  templateUrl: './product-promotions.component.html',
  styleUrls: ['./product-promotions.component.scss']
})
export class ProductPromotionsComponent implements OnInit {

  loading = false;
  successMsg: string | null = null;
  errorMsg: string | null = null;

  name = '';
  description = '';
  type: 'PERCENTAGE' | 'FIXED' = 'PERCENTAGE';
  value: number | null = null;
  startDate = '';
  endDate = '';
  productIds = '';
  categoryIds = '';
  minQuantity: number | null = null;
  maxUses: number | null = null;

  // Sélection via listes
  products: ProductListItem[] = [];
  categoriesFlat: { id: string; labelPath: string }[] = [];
  selectedProductIds: string[] = [];
  selectedCategoryIds: string[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  private loadProducts(): void {
    this.productService.getProducts({ page_size: 100 }).subscribe({
      next: (res) => {
        if (res && res.success && Array.isArray(res.data)) {
          this.products = res.data;
        }
      },
      error: () => {
        // on garde silencieux pour ne pas bloquer la page
      }
    });
  }

  private loadCategories(): void {
    this.productService.getCategoriesTree().subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS' && Array.isArray(res.data)) {
          this.categoriesFlat = this.flattenCategories(res.data);
        }
      },
      error: () => {
        // silencieux
      }
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

    if (!this.name || this.value === null || !this.startDate || !this.endDate) {
      this.errorMsg = 'Veuillez renseigner au minimum le nom, la valeur et la période de la promotion.';
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
      product_ids: this.selectedProductIds && this.selectedProductIds.length
        ? this.selectedProductIds
        : undefined,
      category_ids: this.selectedCategoryIds && this.selectedCategoryIds.length
        ? this.selectedCategoryIds
        : undefined,
      min_quantity: this.minQuantity ?? undefined,
      max_uses: this.maxUses ?? undefined
    };

    this.productService.createPromotion(body).subscribe({
      next: () => {
        this.successMsg = 'Promotion créée avec succès.';
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Erreur lors de la création de la promotion.';
        this.loading = false;
      }
    });
  }
}


