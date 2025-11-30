import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, ProductDetail } from 'src/app/core/shared/services/product.service';
import { MediaUrlService } from 'src/app/core/shared/services/media-url.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {

  productId!: string;
  loading = false;
  errorMsg: string | null = null;
  product: ProductDetail | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    public mediaUrlService: MediaUrlService
  ) {}

  onBack(): void {
    this.router.navigate(['/admin/products']);
  }

  onEdit(): void {
    if (this.productId) {
      this.router.navigate(['/admin/products/edit', this.productId]);
    }
  }

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id') as string;
    this.loadProduct();
  }

  loadProduct(): void {
    if (!this.productId) {
      this.errorMsg = 'Produit introuvable (ID manquant).';
      return;
    }

    this.loading = true;
    this.errorMsg = null;

    this.productService.getProductById(this.productId).subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS') {
          this.product = res.data as ProductDetail;
        } else {
          this.errorMsg = res?.message || 'Impossible de charger le produit.';
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Erreur lors du chargement du produit.';
        this.loading = false;
      }
    });
  }
}


