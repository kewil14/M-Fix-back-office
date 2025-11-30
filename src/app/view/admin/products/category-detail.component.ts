import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService, CategoryDetail } from 'src/app/core/shared/services/product.service';
import { MediaUrlService } from 'src/app/core/shared/services/media-url.service';

@Component({
  selector: 'app-category-detail',
  templateUrl: './category-detail.component.html',
  styleUrls: ['./category-detail.component.scss']
})
export class CategoryDetailComponent implements OnInit {

  categoryId!: string;
  loading = false;
  errorMsg: string | null = null;
  category: CategoryDetail | null = null;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    public mediaUrlService: MediaUrlService
  ) {}

  ngOnInit(): void {
    this.categoryId = this.route.snapshot.paramMap.get('id') as string;
    this.loadCategory();
  }

  loadCategory(): void {
    if (!this.categoryId) {
      this.errorMsg = 'Catégorie introuvable (ID manquant).';
      return;
    }

    this.loading = true;
    this.errorMsg = null;

    this.productService.getCategoryById(this.categoryId).subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS') {
          this.category = res.data as CategoryDetail;
        } else {
          this.errorMsg = res?.message || 'Impossible de charger la catégorie.';
        }
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Erreur lors du chargement de la catégorie.';
        this.loading = false;
      }
    });
  }
}


