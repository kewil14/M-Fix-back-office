import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, ProductDetail, BrandListItem, CategoryTreeItem, ProductTypeListItem, TagListItem } from 'src/app/core/shared/services/product.service';
import { AvatarUploadService, MediaResponse } from 'src/app/core/shared/services/avatar-upload.service';
import { MediaUrlService } from 'src/app/core/shared/services/media-url.service';
import { ShopService } from 'src/app/core/shared/services/shop.service';
import { PermissionService } from 'src/app/core/shared/services/permission.service';
import { WorkspaceService, WorkspaceDto } from 'src/app/core/shared/services/workspace.service';
import { ShopResponseDto } from 'src/app/core/shared/dtos/shop-response-dto';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-product-edit',
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.scss']
})
export class ProductEditComponent implements OnInit {

  productId: string | null = null;
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

  // Champs principaux du produit
  label = '';
  description = '';
  price: number | null = null;
  sku = '';
  barcode = '';
  weight: number | null = null;
  dimensions = '';
  state: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | 'DELETED' = 'ACTIVE';
  mainImageUrl = '';
  isFeatured = false;
  brandId = '';
  categoryId = '';
  productTypeId = '';
  shopId = '';
  
  // SEO
  seoMetaTitle = '';
  seoMetaDescription = '';
  seoMetaKeywords = '';
  seoSlug = '';
  seoCanonicalUrl = '';
  seoCollapsed = true;
  
  mediaIds: string[] = [];

  brands: BrandListItem[] = [];
  categoriesFlat: { id: string; labelPath: string }[] = [];
  productTypes: ProductTypeListItem[] = [];
  shops: ShopResponseDto[] = [];
  tags: TagListItem[] = [];
  selectedTagIds: string[] = [];

  mainImagePreview: string | null = null;
  isUploadingMainImage = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public productService: ProductService,
    private avatarUploadService: AvatarUploadService,
    private mediaUrlService: MediaUrlService,
    private shopService: ShopService,
    public permissionService: PermissionService,
    private workspaceService: WorkspaceService,
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productId = id;
      this.isEditMode = true;
      this.loadProduct(id);
    }
  }

  loadInitialData(): void {
    this.loadWorkspaces();
    // Ne charger les données que si on a un workspaceId (pour non-admin) ou attendre la sélection (pour admin)
    const tokenWorkspaceId = this.permissionService.getWorkspaceId();
    if (tokenWorkspaceId && !this.permissionService.isSuperAdmin() && !this.permissionService.isAdmin()) {
      this.selectedWorkspaceId = tokenWorkspaceId;
      this.loadBrandsAndCategories(tokenWorkspaceId);
      this.loadTags(tokenWorkspaceId);
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
        this.loadShopsForWorkspace();
      } else {
        this.showWorkspaceSelectionMessage = true;
      }
    }
  }

  onWorkspaceChange(): void {
    if (this.selectedWorkspaceId) {
      this.showWorkspaceSelectionMessage = false;
      this.loadShopsForWorkspace();
      // Recharger product types, categories, brands et tags avec le workspaceId sélectionné
      this.loadBrandsAndCategories(this.selectedWorkspaceId);
      this.loadTags(this.selectedWorkspaceId);
    } else {
      // Si aucun workspace n'est sélectionné, réinitialiser les listes
      this.brands = [];
      this.categoriesFlat = [];
      this.productTypes = [];
      this.tags = [];
      this.shops = [];
      this.brandId = '';
      this.categoryId = '';
      this.productTypeId = '';
      this.shopId = '';
      this.selectedTagIds = [];
    }
  }

  onBack(): void {
    this.router.navigate(['/admin/products']);
  }

  loadProduct(id: string): void {
    this.loading = true;
    this.loadError = null;

    this.productService.getProductById(id).subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS') {
          const p: ProductDetail = res.data as ProductDetail;
          this.label = p.label;
          this.description = p.description || '';
          this.price = p.price;
          this.sku = p.sku;
          this.barcode = p.barcode || '';
          this.weight = p.weight || null;
          this.dimensions = p.dimensions || '';
          this.state = (p.state as any) || 'ACTIVE';
          this.mainImageUrl = p.main_image_url || '';
          this.mainImagePreview = p.main_image_url ? this.mediaUrlService.getMediaUrl(p.main_image_url) : null;
          this.brandId = p.brand?.id || '';
          this.categoryId = p.category?.id || '';
          this.productTypeId = p.product_type_id || '';
          this.shopId = p.shop_id || '';
          this.selectedWorkspaceId = p.workspace_id || '';
          this.isFeatured = p.is_featured || false;

          if (this.selectedWorkspaceId) {
            this.showWorkspaceSelectionMessage = false;
            this.loadShopsForWorkspace();
            // Recharger les données liées au workspace (brands, categories, product types, tags)
            this.loadBrandsAndCategories(this.selectedWorkspaceId);
            this.loadTags(this.selectedWorkspaceId);
          }

          if ((p as any).tags && Array.isArray((p as any).tags)) {
            this.selectedTagIds = ((p as any).tags as any[]).map((tag: any) => tag.id || tag);
          } else if ((p as any).tag_ids && Array.isArray((p as any).tag_ids)) {
            this.selectedTagIds = (p as any).tag_ids;
          }
          if (p.seo) {
            this.seoMetaTitle = p.seo.meta_title || '';
            this.seoMetaDescription = p.seo.meta_description || '';
            this.seoMetaKeywords = p.seo.meta_keywords || '';
            this.seoSlug = p.seo.slug || '';
            this.seoCanonicalUrl = p.seo.canonical_url || '';
          }
        } else {
          this.loadError = res?.message || 'Impossible de charger le produit.';
        }
        this.loading = false;
      },
      error: () => {
        this.loadError = 'Erreur lors du chargement du produit.';
        this.loading = false;
      }
    });
  }

  loadBrandsAndCategories(workspaceId?: string): void {
    // Utiliser le workspaceId passé en paramètre, sinon celui sélectionné, sinon undefined
    // Pour Super Admin et Admin, le workspaceId doit être fourni explicitement
    const effectiveWorkspaceId = workspaceId || this.selectedWorkspaceId || undefined;
    
    // Si on est Super Admin ou Admin et qu'aucun workspace n'est sélectionné, ne pas charger
    if ((this.permissionService.isSuperAdmin() || this.permissionService.isAdmin()) && !effectiveWorkspaceId) {
      console.log('[ProductEditComponent] Workspace ID requis pour Super Admin/Admin - données non chargées');
      this.brands = [];
      this.categoriesFlat = [];
      this.productTypes = [];
      return;
    }
    
    console.log('[ProductEditComponent] Loading brands, categories and product types for workspace:', effectiveWorkspaceId);
    
    // Charger les brands avec le workspaceId
    this.productService.getBrands({ workspaceId: effectiveWorkspaceId, state: 'ACTIVE' }).subscribe({
      next: (res) => {
        this.brands = (res.data as BrandListItem[]) || [];
        console.log('[ProductEditComponent] ✅ Brands loaded for workspace:', effectiveWorkspaceId, '- Count:', this.brands.length);
      },
      error: (err) => {
        console.error('[ProductEditComponent] ❌ Error loading brands:', err);
        this.brands = [];
      }
    });

    // Charger les categories avec le workspaceId
    this.productService.getCategoriesTree({ workspaceId: effectiveWorkspaceId, state: 'ACTIVE' }).subscribe({
      next: (res) => {
        this.categoriesFlat = [];
        (res.data as CategoryTreeItem[] || []).forEach(cat => this.flattenCategory(cat));
        console.log('[ProductEditComponent] ✅ Categories loaded for workspace:', effectiveWorkspaceId, '- Count:', this.categoriesFlat.length);
      },
      error: (err) => {
        console.error('[ProductEditComponent] ❌ Error loading categories:', err);
        this.categoriesFlat = [];
      }
    });

    // Charger les product types avec le workspaceId
    this.productService.getProductTypes({ state: 'ACTIVE', workspace_id: effectiveWorkspaceId }).subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS') {
          this.productTypes = (Array.isArray(res.data) ? res.data : res.data?.content || res.data?.data || []);
          console.log('[ProductEditComponent] ✅ Product types loaded for workspace:', effectiveWorkspaceId, '- Count:', this.productTypes.length);
        }
      },
      error: (err) => {
        console.error('[ProductEditComponent] ❌ Error loading product types:', err);
        this.productTypes = [];
      }
    });
  }

  loadTags(workspaceId?: string): void {
    // Utiliser le workspaceId passé en paramètre, sinon celui sélectionné, sinon undefined
    const effectiveWorkspaceId = workspaceId || this.selectedWorkspaceId || undefined;
    
    // Si on est Super Admin ou Admin et qu'aucun workspace n'est sélectionné, ne pas charger
    if ((this.permissionService.isSuperAdmin() || this.permissionService.isAdmin()) && !effectiveWorkspaceId) {
      console.log('[ProductEditComponent] Workspace ID requis pour Super Admin/Admin - tags non chargés');
      this.tags = [];
      return;
    }
    
    console.log('[ProductEditComponent] Loading tags for workspace:', effectiveWorkspaceId);
    
    this.productService.getTags({ state: 'ACTIVE', workspaceId: effectiveWorkspaceId }).subscribe({
      next: (res) => {
        this.tags = (res.data as TagListItem[]) || [];
        console.log('[ProductEditComponent] ✅ Tags loaded for workspace:', effectiveWorkspaceId, '- Count:', this.tags.length);
      },
      error: (err) => {
        console.error('[ProductEditComponent] ❌ Error loading tags:', err);
        this.tags = [];
      }
    });
  }

  loadShopsForWorkspace(): void {
    this.shops = [];
    this.shopId = '';

    if (!this.selectedWorkspaceId) return;

    this.shopService.getShopsByWorkspace(this.selectedWorkspaceId).subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS' && Array.isArray(res.data)) {
          this.shops = res.data;
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

  onMainImageFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    this.uploadMainImage(input.files[0]);
  }

  onMainImageFileDropped(files: FileList): void {
    if (!files || files.length === 0) return;
    this.uploadMainImage(files[0]);
  }

  removeMainImage(): void {
    this.mainImageUrl = '';
    this.mainImagePreview = null;
  }

  private uploadMainImage(file: File): void {
    this.isUploadingMainImage = true;
    this.avatarUploadService.uploadAvatar(file, { entityType: 'PRODUCT', altText: this.label || 'Image produit' }).subscribe({
      next: (media: MediaResponse) => {
        const url = media.cdnUrl || media.fileName;
        this.mainImageUrl = url;
        this.mainImagePreview = this.mediaUrlService.getMediaUrl(url);
        this.isUploadingMainImage = false;
      },
      error: () => {
        this.isUploadingMainImage = false;
        this.saveError = 'Erreur lors de l\'upload de l\'image principale.';
      }
    });
  }

  onSubmit(): void {
    this.saveError = null;
    this.saveSuccess = null;

    if (!this.selectedWorkspaceId) {
      this.saveError = 'Veuillez sélectionner un workspace.';
      return;
    }
    if (!this.label.trim() || this.price === null || !this.sku.trim() || !this.shopId.trim() || !this.productTypeId.trim() || !this.categoryId.trim()) {
      this.saveError = 'Les champs suivants sont obligatoires : nom, prix, SKU, boutique, type de produit et catégorie.';
      return;
    }

    const body: any = {
      label: this.label.trim(),
      description: this.description?.trim() || undefined,
      price: this.price,
      sku: this.sku.trim(),
      barcode: this.barcode?.trim() || undefined,
      weight: this.weight || undefined,
      dimensions: this.dimensions?.trim() || undefined,
      is_featured: this.isFeatured,
      main_image_url: this.mainImageUrl?.trim() || undefined,
      media_ids: this.mediaIds.length > 0 ? this.mediaIds : [],
      shop_id: this.shopId.trim(),
      workspace_id: this.selectedWorkspaceId.trim(),
      product_type_id: this.productTypeId.trim(),
      product_category_id: this.categoryId.trim(),
      brand_id: this.brandId?.trim() || undefined,
      tag_ids: this.selectedTagIds && this.selectedTagIds.length > 0 ? this.selectedTagIds : [],
      state: this.state,
      seo: (this.seoMetaTitle || this.seoMetaDescription || this.seoMetaKeywords || this.seoSlug || this.seoCanonicalUrl) ? {
        meta_title: this.seoMetaTitle?.trim() || undefined,
        meta_description: this.seoMetaDescription?.trim() || undefined,
        meta_keywords: this.seoMetaKeywords?.trim() || undefined,
        slug: this.seoSlug?.trim() || undefined,
        canonical_url: this.seoCanonicalUrl?.trim() || undefined
      } : undefined
    };

    const obs = this.isEditMode
      ? this.productService.updateProduct(this.productId!, body)
      : this.productService.createProduct(body);

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.saveSuccess = `Produit ${this.isEditMode ? 'mis à jour' : 'créé'} avec succès.`;
        setTimeout(() => this.router.navigate(['/admin/products']), 1500);
      },
      error: (err) => {
        this.saving = false;
        this.saveError = err?.error?.message || `Erreur lors de la ${this.isEditMode ? 'mise à jour' : 'création'} du produit.`;
      }
    });
  }
}