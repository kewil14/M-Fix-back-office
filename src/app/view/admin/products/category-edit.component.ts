import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, CategoryDetail, CategoryTreeItem } from 'src/app/core/shared/services/product.service';
import { AvatarUploadService, MediaResponse } from 'src/app/core/shared/services/avatar-upload.service';
import { MediaUrlService } from 'src/app/core/shared/services/media-url.service';
import { WorkspaceService, WorkspaceDto } from 'src/app/core/shared/services/workspace.service';
import { PermissionService } from 'src/app/core/shared/services/permission.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-category-edit',
  templateUrl: './category-edit.component.html',
  styleUrls: ['./category-edit.component.scss']
})
export class CategoryEditComponent implements OnInit {

  categoryId: string | null = null;
  isEditMode = false;

  loading = false;
  saving = false;
  loadError: string | null = null;
  saveError: string | null = null;
  saveSuccess: string | null = null;

  // Workspace selection
  workspaces$: Observable<WorkspaceDto[]> = of([]);
  selectedWorkspaceId: string = '';
  showWorkspaceSelectionMessage: boolean = false;

  label = '';
  description = '';
  displayOrder: number | null = null;
  state: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | 'DELETED' = 'ACTIVE';

  parentCategoryId: string = '';
  categoriesFlat: { id: string; labelPath: string }[] = [];

  mainImageUrl: string | null = null;
  mainImagePreview: string | null = null;
  mainImageMediaId: string | null = null;
  isUploadingImage = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private avatarUploadService: AvatarUploadService,
    private mediaUrlService: MediaUrlService,
    private workspaceService: WorkspaceService,
    public permissionService: PermissionService,
  ) {}

  ngOnInit(): void {
    this.loadWorkspaces();
    const id = this.route.snapshot.paramMap.get('id');
    this.loadCategoriesForParentSelect();
    if (id) {
      this.categoryId = id;
      this.isEditMode = true;
      this.loadCategory(id);
    }
  }

  loadWorkspaces(): void {
    this.workspaces$ = this.workspaceService.findAllWorkspaces().pipe(
      map(response => response.status === 'SUCCESS' ? response.data : [])
    );

    if (this.permissionService.isSuperAdmin() || this.permissionService.isAdmin()) {
      this.showWorkspaceSelectionMessage = true;
    } else {
      const tokenWorkspaceId = this.permissionService.getWorkspaceId();
      if (tokenWorkspaceId) {
        this.selectedWorkspaceId = tokenWorkspaceId;
        this.showWorkspaceSelectionMessage = false;
      } else {
        this.showWorkspaceSelectionMessage = true;
      }
    }
  }

  onWorkspaceChange(): void {
    if (this.selectedWorkspaceId) {
      this.showWorkspaceSelectionMessage = false;
    }
  }

  onBack(): void {
    this.router.navigate(['/admin/product-categories']);
  }

  loadCategory(id: string): void {
    this.loading = true;
    this.loadError = null;

    this.productService.getCategoryById(id).subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS') {
          const c: CategoryDetail = res.data as CategoryDetail;
          this.label = c.label;
          this.description = c.description || '';
          this.displayOrder = c.display_order ?? null;
          this.state = (c.state as any) || 'ACTIVE';
          this.parentCategoryId = c.parent_category_id || '';
          this.mainImageUrl = c.main_image_url || null;
          this.mainImagePreview = c.main_image_url
            ? this.mediaUrlService.getMediaUrl(c.main_image_url)
            : null;
          if (this.isEditMode) {
            this.selectedWorkspaceId = (c as any).workspace_id;
            this.showWorkspaceSelectionMessage = false;
          }
        } else {
          this.loadError = res?.message || 'Impossible de charger la catégorie.';
        }
        this.loading = false;
      },
      error: () => {
        this.loadError = 'Erreur lors du chargement de la catégorie.';
        this.loading = false;
      }
    });
  }

  loadCategoriesForParentSelect(): void {
    this.productService.getCategoriesTree().subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS') {
          this.categoriesFlat = [];
          (res.data as CategoryTreeItem[] || []).forEach(cat =>
            this.flattenCategory(cat)
          );
        }
      }
    });
  }

  private flattenCategory(cat: CategoryTreeItem, prefix: string = ''): void {
    const labelPath = prefix ? `${prefix} / ${cat.label}` : cat.label;
    this.categoriesFlat.push({ id: cat.id, labelPath });
    if (cat.subcategories && cat.subcategories.length) {
      cat.subcategories.forEach(sub => this.flattenCategory(sub, labelPath));
    }
  }

  onSubmit(): void {
    this.saveError = null;
    this.saveSuccess = null;

    if (!this.selectedWorkspaceId) {
      this.saveError = 'Veuillez sélectionner un workspace.';
      return;
    }

    if (!this.label.trim()) {
      this.saveError = 'Le nom de la catégorie est obligatoire.';
      return;
    }

    const body: any = {
      label: this.label.trim(),
      description: this.description?.trim() || undefined,
      display_order: this.displayOrder ?? undefined,
      state: this.state,
      parent_category_id: this.parentCategoryId || undefined,
      main_image_url: this.mainImageUrl || undefined,
      workspace_id: this.selectedWorkspaceId,
    };

    if (this.mainImageMediaId) {
      body.add_media_ids = [this.mainImageMediaId];
    }

    this.saving = true;

    const obs = this.isEditMode && this.categoryId
      ? this.productService.updateCategory(this.categoryId, body)
      : this.productService.createCategory(body);

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.saveSuccess = this.isEditMode
          ? 'Catégorie mise à jour avec succès.'
          : 'Catégorie créée avec succès.';
        if (!this.isEditMode) {
          setTimeout(() => this.router.navigate(['/admin/product-categories']), 1500);
        } else {
          if(this.categoryId) this.loadCategory(this.categoryId);
        }
      },
      error: (err) => {
        this.saving = false;
        this.saveError = err?.error?.message || (this.isEditMode
          ? 'Erreur lors de la mise à jour de la catégorie.'
          : 'Erreur lors de la création de la catégorie.');
      }
    });
  }

  onMainImageFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    this.uploadMainImage(file);
  }

  onMainImageFileDropped(files: FileList): void {
    if (!files || files.length === 0) return;
    const file = files[0];
    this.uploadMainImage(file);
  }

  removeMainImage(): void {
    this.mainImageUrl = null;
    this.mainImagePreview = null;
    this.mainImageMediaId = null;
  }

  private uploadMainImage(file: File): void {
    this.isUploadingImage = true;
    this.avatarUploadService.uploadAvatar(file, {
      entityType: 'PRODUCT_CATEGORY',
      altText: this.label || 'Image catégorie'
    }).subscribe({
      next: (media: MediaResponse) => {
        const url = media.cdnUrl || media.fileName;
        this.mainImageUrl = url;
        this.mainImagePreview = this.mediaUrlService.getMediaUrl(url);
        this.mainImageMediaId = media.id;
        this.isUploadingImage = false;
      },
      error: () => {
        this.isUploadingImage = false;
        this.saveError = 'Erreur lors de l’upload de l’image de la catégorie.';
      }
    });
  }
}


