import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, TagListItem } from 'src/app/core/shared/services/product.service';

@Component({
  selector: 'app-tag-detail',
  templateUrl: './tag-detail.component.html',
  styleUrls: ['./tag-detail.component.scss']
})
export class TagDetailComponent implements OnInit {

  tagId: string | null = null;
  loading = false;
  error: string | null = null;
  tag: TagListItem | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.tagId = id;
      this.loadTag(id);
    }
  }

  onBack(): void {
    this.router.navigate(['/admin/product-tags']);
  }

  onEdit(): void {
    if (this.tagId) {
      this.router.navigate(['/admin/product-tags/edit', this.tagId]);
    }
  }

  loadTag(id: string): void {
    this.loading = true;
    this.error = null;

    this.productService.getTagById(id).subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS') {
          this.tag = res.data as TagListItem;
        } else {
          this.error = res?.message || 'Impossible de charger le tag.';
        }
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement du tag.';
        this.loading = false;
      }
    });
  }
}






