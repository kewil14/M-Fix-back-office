import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, ProductTypeListItem } from 'src/app/core/shared/services/product.service';

@Component({
  selector: 'app-product-type-edit',
  templateUrl: './product-type-edit.component.html',
  styleUrls: ['./product-type-edit.component.scss']
})
export class ProductTypeEditComponent implements OnInit {

  typeId: string | null = null;
  isEditMode = false;

  loading = false;
  saving = false;
  loadError: string | null = null;
  saveError: string | null = null;
  saveSuccess: string | null = null;

  label = '';
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
      this.typeId = id;
      this.isEditMode = true;
      this.loadProductType(id);
    }
  }

  onBack(): void {
    this.router.navigate(['/admin/product-types']);
  }

  loadProductType(id: string): void {
    this.loading = true;
    this.loadError = null;

    this.productService.getProductTypeById(id).subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS') {
          const pt: ProductTypeListItem = res.data as ProductTypeListItem;
          this.label = pt.label;
          this.description = pt.description || '';
          this.state = (pt.state as any) || 'ACTIVE';
        } else {
          this.loadError = res?.message || 'Impossible de charger le type de produit.';
        }
        this.loading = false;
      },
      error: () => {
        this.loadError = 'Erreur lors du chargement du type de produit.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    this.saveError = null;
    this.saveSuccess = null;

    if (!this.label.trim()) {
      this.saveError = 'Le label est obligatoire.';
      return;
    }

    const body: any = {
      label: this.label.trim(),
      description: this.description?.trim() || undefined,
      state: this.state
    };

    this.saving = true;

    const obs = this.isEditMode && this.typeId
      ? this.productService.updateProductType(this.typeId, body)
      : this.productService.createProductType(body);

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.saveSuccess = this.isEditMode
          ? 'Type de produit mis à jour avec succès.'
          : 'Type de produit créé avec succès.';
        if (!this.isEditMode) {
          setTimeout(() => {
            this.router.navigate(['/admin/product-types']);
          }, 1500);
        }
      },
      error: () => {
        this.saving = false;
        this.saveError = this.isEditMode
          ? 'Erreur lors de la mise à jour du type de produit.'
          : 'Erreur lors de la création du type de produit.';
      }
    });
  }
}

