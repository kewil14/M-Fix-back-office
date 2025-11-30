import { Component } from '@angular/core';
import { ProductService, ProductDetail, ProductListItem, ProductSearchParams } from 'src/app/core/shared/services/product.service';

@Component({
  selector: 'app-product-variants',
  templateUrl: './product-variants.component.html',
  styleUrls: ['./product-variants.component.scss']
})
export class ProductVariantsComponent {

  loading = false;
  errorMsg: string | null = null;
  successMsg: string | null = null;

  products: ProductListItem[] = [];
  productSearch: string = '';
  selectedProductId: string = '';
  product: ProductDetail | null = null;
  variants: any[] = [];

  // Formulaire variant
  editingVariantId: string | null = null;
  variantLabel: string = '';
  variantDescription: string = '';
  variantPrice: number | null = null;
  variantSku: string = '';
  variantBarcode: string = '';
  variantState: string = 'ACTIVE';

  constructor(
    private productService: ProductService,
  ) {
    this.loadProducts();
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

  loadVariants(): void {
    this.errorMsg = null;
    this.successMsg = null;
    this.product = null;
    this.variants = [];
    this.resetVariantForm();

    if (!this.selectedProductId) {
      this.errorMsg = 'Veuillez sélectionner un produit.';
      return;
    }

    this.loading = true;

    this.productService.getProductById(this.selectedProductId).subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS') {
          this.product = res.data as ProductDetail;
        }
      },
      error: () => {
        this.errorMsg = 'Erreur lors du chargement du produit.';
      }
    });

    this.productService.getVariantsForProduct(this.selectedProductId).subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS') {
          // le backend peut retourner data = [] ou un objet; on force en tableau
          const data = Array.isArray(res.data) ? res.data : (res.data?.items || []);
          this.variants = data || [];
        } else {
          this.errorMsg = res?.message || 'Impossible de charger les variants du produit.';
        }
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Erreur lors du chargement des variants.';
        this.loading = false;
      }
    });
  }

  selectVariantForEdit(variant: any): void {
    this.successMsg = null;
    this.errorMsg = null;
    this.editingVariantId = variant.id || null;
    this.variantLabel = variant.label || '';
    this.variantDescription = variant.description || '';
    this.variantPrice = variant.price ?? null;
    this.variantSku = variant.sku || '';
    this.variantBarcode = variant.barcode || '';
    this.variantState = variant.state || 'ACTIVE';
  }

  resetVariantForm(): void {
    this.editingVariantId = null;
    this.variantLabel = '';
    this.variantDescription = '';
    this.variantPrice = null;
    this.variantSku = '';
    this.variantBarcode = '';
    this.variantState = 'ACTIVE';
  }

  saveVariant(): void {
    this.successMsg = null;
    this.errorMsg = null;

    if (!this.selectedProductId) {
      this.errorMsg = 'Veuillez d\'abord sélectionner un produit.';
      return;
    }

    if (!this.variantLabel || this.variantPrice === null || !this.variantSku) {
      this.errorMsg = 'Merci de renseigner au minimum le label, le prix et le SKU du variant.';
      return;
    }

    const body: any = {
      label: this.variantLabel,
      description: this.variantDescription || undefined,
      price: this.variantPrice,
      sku: this.variantSku,
      barcode: this.variantBarcode || undefined,
      state: this.variantState || 'ACTIVE',
    };

    this.loading = true;

    const obs = this.editingVariantId
      ? this.productService.updateVariant(this.selectedProductId, this.editingVariantId, body)
      : this.productService.createVariant(this.selectedProductId, body);

    obs.subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS') {
          this.successMsg = this.editingVariantId
            ? 'Variant mis à jour avec succès.'
            : 'Variant créé avec succès.';
          this.resetVariantForm();
          this.loadVariants();
        } else {
          this.errorMsg = res?.message || 'Erreur lors de l\'enregistrement du variant.';
          this.loading = false;
        }
      },
      error: () => {
        this.errorMsg = 'Erreur lors de l\'enregistrement du variant.';
        this.loading = false;
      }
    });
  }

  deleteVariant(variant: any): void {
    this.successMsg = null;
    this.errorMsg = null;

    if (!this.selectedProductId || !variant?.id) {
      this.errorMsg = 'Produit ou variant invalide.';
      return;
    }

    const confirmed = confirm(`Supprimer le variant "${variant.label}" ?`);
    if (!confirmed) {
      return;
    }

    this.loading = true;

    this.productService.deleteVariant(this.selectedProductId, variant.id).subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS') {
          this.successMsg = 'Variant supprimé avec succès.';
          this.loadVariants();
        } else {
          this.errorMsg = res?.message || 'Erreur lors de la suppression du variant.';
          this.loading = false;
        }
      },
      error: () => {
        this.errorMsg = 'Erreur lors de la suppression du variant.';
        this.loading = false;
      }
    });
  }
}


