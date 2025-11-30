import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, ProductTypeListItem } from 'src/app/core/shared/services/product.service';

@Component({
  selector: 'app-product-type-detail',
  templateUrl: './product-type-detail.component.html',
  styleUrls: ['./product-type-detail.component.scss']
})
export class ProductTypeDetailComponent implements OnInit {

  typeId: string | null = null;
  loading = false;
  error: string | null = null;
  productType: ProductTypeListItem | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.typeId = id;
      this.loadProductType(id);
    }
  }

  onBack(): void {
    this.router.navigate(['/admin/product-types']);
  }

  onEdit(): void {
    if (this.typeId) {
      this.router.navigate(['/admin/product-types/edit', this.typeId]);
    }
  }

  loadProductType(id: string): void {
    this.loading = true;
    this.error = null;

    this.productService.getProductTypeById(id).subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS') {
          this.productType = res.data as ProductTypeListItem;
        } else {
          this.error = res?.message || 'Impossible de charger le type de produit.';
        }
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement du type de produit.';
        this.loading = false;
      }
    });
  }
}

