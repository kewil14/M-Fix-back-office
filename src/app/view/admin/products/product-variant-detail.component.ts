import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, ProductDetail } from 'src/app/core/shared/services/product.service';
import { PermissionService } from 'src/app/core/shared/services/permission.service';

@Component({
  selector: 'app-product-variant-detail',
  templateUrl: './product-variant-detail.component.html',
  styleUrls: ['./product-variant-detail.component.scss']
})
export class ProductVariantDetailComponent implements OnInit {

  productId!: string;
  variantId!: string;
  loading = false;
  errorMsg: string | null = null;
  product: ProductDetail | null = null;
  variant: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    public permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('productId') as string;
    this.variantId = this.route.snapshot.paramMap.get('variantId') as string;
    
    if (!this.productId || !this.variantId) {
      this.errorMsg = 'Paramètres manquants (productId ou variantId).';
      return;
    }

    this.loadVariantDetail();
  }

  loadVariantDetail(): void {
    this.loading = true;
    this.errorMsg = null;

    // Charger le produit
    this.productService.getProductById(this.productId).subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS') {
          this.product = res.data as ProductDetail;
          // Trouver le variant correspondant
          if (this.product.variants) {
            this.variant = this.product.variants.find((v: any) => v.id === this.variantId);
            if (!this.variant) {
              // Si le variant n'est pas dans les variants du produit, essayer de le charger directement
              this.loadVariantDirectly();
            } else {
              this.loading = false;
            }
          } else {
            this.loadVariantDirectly();
          }
        } else {
          this.errorMsg = res?.message || 'Impossible de charger le produit.';
          this.loading = false;
        }
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Erreur lors du chargement du produit.';
        this.loading = false;
      }
    });
  }

  loadVariantDirectly(): void {
    // Essayer de charger les variants et trouver celui qui correspond
    this.productService.getVariantsForProduct(this.productId).subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS') {
          const data = Array.isArray(res.data) ? res.data : (res.data?.items || []);
          this.variant = data.find((v: any) => v.id === this.variantId);
          if (!this.variant) {
            this.errorMsg = 'Variant introuvable.';
          }
        } else {
          this.errorMsg = res?.message || 'Impossible de charger les variants.';
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Erreur lors du chargement des variants.';
        this.loading = false;
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/admin/product-variants']);
  }

  onEdit(): void {
    // Rediriger vers la liste avec le modal ouvert
    this.router.navigate(['/admin/product-variants'], {
      queryParams: { productId: this.productId, variantId: this.variantId }
    });
  }

  getVariantState(): string {
    return this.variant?.state || 'ACTIVE';
  }

  getStateBadgeClass(): string {
    const state = this.getVariantState();
    switch (state) {
      case 'ACTIVE':
        return 'bg-success';
      case 'INACTIVE':
        return 'bg-secondary';
      case 'DRAFT':
        return 'bg-warning';
      default:
        return 'bg-primary';
    }
  }
}

