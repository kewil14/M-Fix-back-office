import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, BrandDetail } from 'src/app/core/shared/services/product.service';
import { AvatarUploadService, MediaResponse } from 'src/app/core/shared/services/avatar-upload.service';
import { MediaUrlService } from 'src/app/core/shared/services/media-url.service';

@Component({
  selector: 'app-brand-edit',
  templateUrl: './brand-edit.component.html',
  styleUrls: ['./brand-edit.component.scss']
})
export class BrandEditComponent implements OnInit {

  brandId: string | null = null;
  isEditMode = false;

  loading = false;
  saving = false;
  loadError: string | null = null;
  saveError: string | null = null;
  saveSuccess: string | null = null;

  label = '';
  description = '';
  website = '';
  state: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | 'DELETED' = 'ACTIVE';

  logoUrl: string | null = null;
  logoPreview: string | null = null;
  logoMediaId: string | null = null;
  isUploadingLogo = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private avatarUploadService: AvatarUploadService,
    private mediaUrlService: MediaUrlService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.brandId = id;
      this.isEditMode = true;
      this.loadBrand(id);
    }
  }

  onBack(): void {
    this.router.navigate(['/admin/product-brands']);
  }

  loadBrand(id: string): void {
    this.loading = true;
    this.loadError = null;

    this.productService.getBrandById(id).subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS') {
          const b: BrandDetail = res.data as BrandDetail;
          this.label = b.label;
          this.description = b.description || '';
          this.website = b.website || '';
          this.state = (b.state as any) || 'ACTIVE';
          this.logoUrl = b.logo_url || null;
          this.logoPreview = b.logo_url ? this.mediaUrlService.getMediaUrl(b.logo_url) : null;
        } else {
          this.loadError = res?.message || 'Impossible de charger la marque.';
        }
        this.loading = false;
      },
      error: () => {
        this.loadError = 'Erreur lors du chargement de la marque.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    this.saveError = null;
    this.saveSuccess = null;

    if (!this.label.trim()) {
      this.saveError = 'Le nom de la marque est obligatoire.';
      return;
    }

    const body: any = {
      label: this.label.trim(),
      description: this.description?.trim() || undefined,
      website: this.website?.trim() || undefined,
      state: this.state,
      logo_url: this.logoUrl || undefined,
    };

    if (this.logoMediaId) {
      body.add_media_ids = [this.logoMediaId];
    }

    this.saving = true;

    const obs = this.isEditMode && this.brandId
      ? this.productService.updateBrand(this.brandId, body)
      : this.productService.createBrand(body);

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.saveSuccess = this.isEditMode
          ? 'Marque mise à jour avec succès.'
          : 'Marque créée avec succès.';
        if (!this.isEditMode) {
          this.router.navigate(['/admin/product-brands']);
        }
      },
      error: () => {
        this.saving = false;
        this.saveError = this.isEditMode
          ? 'Erreur lors de la mise à jour de la marque.'
          : 'Erreur lors de la création de la marque.';
      }
    });
  }

  onLogoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    this.uploadLogo(file);
  }

  onLogoFileDropped(files: FileList): void {
    if (!files || files.length === 0) return;
    const file = files[0];
    this.uploadLogo(file);
  }

  removeLogo(): void {
    this.logoUrl = null;
    this.logoPreview = null;
    this.logoMediaId = null;
  }

  private uploadLogo(file: File): void {
    this.isUploadingLogo = true;
    this.avatarUploadService.uploadAvatar(file, {
      entityType: 'BRAND',
      altText: this.label || 'Logo marque'
    }).subscribe({
      next: (media: MediaResponse) => {
        const url = media.cdnUrl || media.fileName;
        this.logoUrl = url;
        this.logoPreview = this.mediaUrlService.getMediaUrl(url);
        this.logoMediaId = media.id;
        this.isUploadingLogo = false;
      },
      error: () => {
        this.isUploadingLogo = false;
        this.saveError = 'Erreur lors de l’upload du logo.';
      }
    });
  }
}


