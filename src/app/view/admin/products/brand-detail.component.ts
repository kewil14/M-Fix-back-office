import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, BrandDetail } from 'src/app/core/shared/services/product.service';
import { MediaUrlService } from 'src/app/core/shared/services/media-url.service';

@Component({
  selector: 'app-brand-detail',
  templateUrl: './brand-detail.component.html',
  styleUrls: ['./brand-detail.component.scss']
})
export class BrandDetailComponent implements OnInit {

  brandId!: string;
  loading = false;
  errorMsg: string | null = null;
  brand: BrandDetail | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    public mediaUrlService: MediaUrlService
  ) {}

  onBack(): void {
    this.router.navigate(['/admin/product-brands']);
  }

  ngOnInit(): void {
    this.brandId = this.route.snapshot.paramMap.get('id') as string;
    this.loadBrand();
  }

  loadBrand(): void {
    if (!this.brandId) {
      this.errorMsg = 'Marque introuvable (ID manquant).';
      return;
    }

    this.loading = true;
    this.errorMsg = null;

    this.productService.getBrandById(this.brandId).subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS') {
          this.brand = res.data as BrandDetail;
        } else {
          this.errorMsg = res?.message || 'Impossible de charger la marque.';
        }
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Erreur lors du chargement de la marque.';
        this.loading = false;
      }
    });
  }
}


