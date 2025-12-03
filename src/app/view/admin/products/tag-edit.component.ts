import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, TagListItem } from 'src/app/core/shared/services/product.service';

@Component({
  selector: 'app-tag-edit',
  templateUrl: './tag-edit.component.html',
  styleUrls: ['./tag-edit.component.scss']
})
export class TagEditComponent implements OnInit {

  tagId: string | null = null;
  isEditMode = false;

  loading = false;
  saving = false;
  loadError: string | null = null;
  saveError: string | null = null;
  saveSuccess: string | null = null;

  label = '';
  slug = '';
  description = '';
  state: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | 'DELETED' = 'ACTIVE';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.tagId = id;
      this.isEditMode = true;
      this.loadTag(id);
    }
  }

  onBack(): void {
    this.router.navigate(['/admin/product-tags']);
  }

  loadTag(id: string): void {
    this.loading = true;
    this.loadError = null;

    this.productService.getTagById(id).subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS') {
          const tag: TagListItem = res.data as TagListItem;
          this.label = tag.label;
          this.slug = tag.slug;
          this.description = tag.description || '';
          this.state = (tag.state as any) || 'ACTIVE';
        } else {
          this.loadError = res?.message || 'Impossible de charger le tag.';
        }
        this.loading = false;
      },
      error: () => {
        this.loadError = 'Erreur lors du chargement du tag.';
        this.loading = false;
      }
    });
  }

  onSlugChange(): void {
    // Générer automatiquement le slug à partir du label si vide
    if (!this.slug && this.label) {
      this.slug = this.label
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
  }

  onSubmit(): void {
    this.saveError = null;
    this.saveSuccess = null;

    if (!this.label.trim() || !this.slug.trim()) {
      this.saveError = 'Le label et le slug sont obligatoires.';
      return;
    }

    const body: any = {
      label: this.label.trim(),
      slug: this.slug.trim(),
      description: this.description?.trim() || undefined,
      state: this.state
    };

    this.saving = true;

    const obs = this.isEditMode && this.tagId
      ? this.productService.updateTag(this.tagId, body)
      : this.productService.createTag(body);

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.saveSuccess = this.isEditMode
          ? 'Tag mis à jour avec succès.'
          : 'Tag créé avec succès.';
        if (!this.isEditMode) {
          setTimeout(() => {
            this.router.navigate(['/admin/product-tags']);
          }, 1500);
        }
      },
      error: (err) => {
        this.saving = false;
        this.saveError = err?.error?.message || (this.isEditMode
          ? 'Erreur lors de la mise à jour du tag.'
          : 'Erreur lors de la création du tag.');
      }
    });
  }
}




