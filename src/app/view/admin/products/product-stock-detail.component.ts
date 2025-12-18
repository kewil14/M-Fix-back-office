import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, ProductDetail } from 'src/app/core/shared/services/product.service';
import { ShopService } from 'src/app/core/shared/services/shop.service';
import { ShopResponseDto } from 'src/app/core/shared/dtos/shop-response-dto';
import { PermissionService } from 'src/app/core/shared/services/permission.service';

@Component({
  selector: 'app-product-stock-detail',
  templateUrl: './product-stock-detail.component.html',
  styleUrls: ['./product-stock-detail.component.scss']
})
export class ProductStockDetailComponent implements OnInit {

  variantId!: string;
  shopId!: string;
  loading = false;
  errorMsg: string | null = null;
  stock: any = null;
  product: ProductDetail | null = null;
  variant: any = null;
  shop: ShopResponseDto | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private shopService: ShopService,
    public permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.variantId = this.route.snapshot.paramMap.get('variantId') as string;
    this.shopId = this.route.snapshot.paramMap.get('shopId') as string;
    
    if (!this.variantId || !this.shopId) {
      this.errorMsg = 'Paramètres manquants (variantId ou shopId).';
      return;
    }

    this.loadStockDetail();
  }

  loadStockDetail(): void {
    this.loading = true;
    this.errorMsg = null;

    // Charger les détails du stock
    this.productService.getStockByVariantAndShop(this.variantId, this.shopId).subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS') {
          // La réponse peut être un tableau ou un objet unique
          if (Array.isArray(res.data) && res.data.length > 0) {
            this.stock = res.data[0];
          } else if (res.data) {
            this.stock = res.data;
          } else {
            this.errorMsg = 'Aucune donnée de stock trouvée.';
            this.loading = false;
            return;
          }

          // Charger les informations du produit et variant
          this.loadProductAndVariant();
          // Charger les informations de la boutique
          this.loadShop();
        } else {
          this.errorMsg = res?.message || 'Impossible de charger les détails du stock.';
          this.loading = false;
        }
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Erreur lors du chargement des détails du stock.';
        this.loading = false;
      }
    });
  }

  loadProductAndVariant(): void {
    // Si on a un product_id dans le stock, charger le produit
    const productId = this.stock?.product_id;
    if (productId) {
      this.productService.getProductById(productId).subscribe({
        next: (res) => {
          if (res && res.status === 'SUCCESS') {
            this.product = res.data as ProductDetail;
            // Trouver le variant correspondant
            if (this.product.variants) {
              this.variant = this.product.variants.find((v: any) => v.id === this.variantId);
            }
          }
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }

  loadShop(): void {
    // Si on a un workspace_id dans le stock, utiliser-le, sinon utiliser celui du token
    const workspaceId = this.stock?.workspace_id || this.permissionService.getWorkspaceId();
    if (!workspaceId || !this.shopId) {
      console.warn('WorkspaceId or shopId not available for loading shop details');
      return;
    }
    
    this.shopService.getShopById(workspaceId, this.shopId).subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS') {
          this.shop = res.data;
        } else {
          console.warn('Shop not found or invalid response:', res);
        }
      },
      error: (err) => {
        console.error('Error loading shop:', err);
        // Ne pas afficher d'erreur critique, juste un warning
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/admin/product-stock']);
  }

  onEdit(): void {
    // Rediriger vers la liste (le composant pourra ouvrir le modal automatiquement)
    this.router.navigate(['/admin/product-stock'], {
      queryParams: { variantId: this.variantId, shopId: this.shopId }
    });
  }

  getAvailableQuantity(): number {
    return this.stock?.available_quantity ?? this.stock?.availableQuantity ?? 0;
  }

  getReservedQuantity(): number {
    return this.stock?.reserved_quantity ?? this.stock?.reservedQuantity ?? 0;
  }

  getTotalQuantity(): number {
    return this.stock?.quantity ?? 0;
  }

  getAlertThreshold(): number {
    return this.stock?.alert_threshold ?? this.stock?.alertThreshold ?? 0;
  }

  isStockLow(): boolean {
    return this.getAvailableQuantity() <= this.getAlertThreshold();
  }

  getStockState(): string {
    return this.stock?.state || 'ACTIVE';
  }

  getStateBadgeClass(): string {
    const state = this.getStockState();
    switch (state) {
      case 'ACTIVE':
        return 'bg-success';
      case 'INACTIVE':
        return 'bg-secondary';
      case 'DELETED':
        return 'bg-danger';
      default:
        return 'bg-primary';
    }
  }

  // Exposer Math pour le template
  Math = Math;
}

