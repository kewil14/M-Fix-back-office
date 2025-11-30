import { Component, OnInit } from '@angular/core';
import { ProductService, ProductListItem } from 'src/app/core/shared/services/product.service';
import { MediaUrlService } from 'src/app/core/shared/services/media-url.service';

@Component({
  selector: 'app-product-media',
  templateUrl: './product-media.component.html',
  styleUrls: ['./product-media.component.scss']
})
export class ProductMediaComponent implements OnInit {

  loading = false;
  errorMsg: string | null = null;

  products: ProductListItem[] = [];
  page = 1;
  pageSize = 20;

  constructor(
    private productService: ProductService,
    public mediaUrlService: MediaUrlService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.errorMsg = null;

    this.productService.getProducts({
      page: this.page,
      page_size: this.pageSize
    }).subscribe({
      next: (response) => {
        if (response && response.success) {
          this.products = response.data || [];
        } else {
          this.errorMsg = response?.message || 'Impossible de charger les produits.';
        }
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Erreur lors du chargement des produits.';
        this.loading = false;
      }
    });
  }
}


