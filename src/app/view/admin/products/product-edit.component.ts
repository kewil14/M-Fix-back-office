import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, ProductDetail, BrandListItem, CategoryTreeItem, ProductTypeListItem } from 'src/app/core/shared/services/product.service';
import { AvatarUploadService, MediaResponse } from 'src/app/core/shared/services/avatar-upload.service';
import { MediaUrlService } from 'src/app/core/shared/services/media-url.service';
import { ShopService } from 'src/app/core/shared/services/shop.service';
import { PermissionService } from 'src/app/core/shared/services/permission.service';
import { WorkspaceService, WorkspaceDto } from 'src/app/core/shared/services/workspace.service';
import { ShopResponseDto } from 'src/app/core/shared/dtos/shop-response-dto';

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
  workspaceId = '';
  shopId = '';
  
  // SEO
  seoMetaTitle = '';
  seoMetaDescription = '';
  seoMetaKeywords = '';
  seoSlug = '';
  seoCanonicalUrl = '';
  seoCollapsed = true; // Section SEO pliée par défaut
  
  // Media IDs (pour les images supplémentaires)
  mediaIds: string[] = [];

  // listes pour sélection
  brands: BrandListItem[] = [];
  categoriesFlat: { id: string; labelPath: string }[] = [];
  productTypes: ProductTypeListItem[] = [];
  workspaces: WorkspaceDto[] = [];
  shops: ShopResponseDto[] = [];

  // upload image principale
  mainImagePreview: string | null = null;
  isUploadingMainImage = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private avatarUploadService: AvatarUploadService,
    private mediaUrlService: MediaUrlService,
    private shopService: ShopService,
    private permissionService: PermissionService,
    private workspaceService: WorkspaceService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.loadBrandsAndCategories();
    if (id) {
      this.productId = id;
      this.isEditMode = true;
      this.loadProduct(id);
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
          this.mainImagePreview = p.main_image_url
            ? this.mediaUrlService.getMediaUrl(p.main_image_url)
            : null;
          this.brandId = p.brand?.id || '';
          this.categoryId = p.category?.id || '';
          this.productTypeId = p.product_type_id || '';
          this.shopId = p.shop_id || '';
          this.isFeatured = p.is_featured || false;
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

  loadBrandsAndCategories(): void {
    this.productService.getBrands().subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS') {
          this.brands = (res.data as BrandListItem[]) || [];
        }
      }
    });

    this.productService.getCategoriesTree().subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS') {
          this.categoriesFlat = [];
          (res.data as CategoryTreeItem[] || []).forEach(cat => this.flattenCategory(cat));
        }
      }
    });

    // Charger les types de produits
    this.productService.getProductTypes().subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS') {
          if (Array.isArray(res.data)) {
            this.productTypes = res.data;
          } else if (res.data?.content) {
            this.productTypes = res.data.content;
          } else if (res.data?.data) {
            this.productTypes = res.data.data;
          } else {
            this.productTypes = [];
          }
        }
      }
    });

    // Charger les workspaces
    this.loadWorkspaces();
  }

  loadWorkspaces(): void {
    this.workspaceService.findAllWorkspaces().subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS' && Array.isArray(res.data)) {
          this.workspaces = res.data;

          // Pré-sélectionner le workspace du token si présent
          const tokenWorkspaceId = this.permissionService.getWorkspaceId();
          if (tokenWorkspaceId && this.workspaces.some(w => w.id === tokenWorkspaceId)) {
            this.workspaceId = tokenWorkspaceId;
            this.loadShopsForWorkspace();
          }
        }
      },
      error: () => {
        // silencieux
      }
    });
  }

  loadShopsForWorkspace(): void {
    this.shops = [];
    this.shopId = '';

    if (!this.workspaceId) {
      return;
    }

    this.shopService.getShopsByWorkspace(this.workspaceId).subscribe({
      next: (res) => {
        if (res && res.status === 'SUCCESS' && Array.isArray(res.data)) {
          this.shops = res.data;
        }
      },
      error: () => {
        // silencieux
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
    const file = input.files[0];
    this.uploadMainImage(file);
  }

  onMainImageFileDropped(files: FileList): void {
    if (!files || files.length === 0) return;
    const file = files[0];
    this.uploadMainImage(file);
  }

  removeMainImage(): void {
    this.mainImageUrl = '';
    this.mainImagePreview = null;
  }

  private uploadMainImage(file: File): void {
    this.isUploadingMainImage = true;
    this.avatarUploadService.uploadAvatar(file, {
      entityType: 'PRODUCT',
      altText: this.label || 'Image produit'
    }).subscribe({
      next: (media: MediaResponse) => {
        // on stocke l'URL à utiliser dans le payload du produit
        const url = media.cdnUrl || media.fileName;
        this.mainImageUrl = url;
        this.mainImagePreview = this.mediaUrlService.getMediaUrl(url);
        this.isUploadingMainImage = false;
      },
      error: () => {
        this.isUploadingMainImage = false;
        this.saveError = 'Erreur lors de l’upload de l’image principale.';
      }
    });
  }

  onSubmit(): void {
    this.saveError = null;
    this.saveSuccess = null;

    if (this.isEditMode) {
      // Mise à jour : validation minimale, tous les champs sont optionnels
      this.updateProduct();
    } else {
      // Création : validation des champs obligatoires
      if (!this.label.trim() || this.price === null || !this.sku.trim() || !this.shopId.trim() || !this.productTypeId.trim() || !this.categoryId.trim()) {
        this.saveError = 'Les champs suivants sont obligatoires : nom, prix, SKU, boutique, type de produit et catégorie.';
        return;
      }
      this.createProduct();
    }
  }

  private createProduct(): void {
    // Construction du payload pour la création selon l'endpoint POST /api/v1/products/products
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
      product_type_id: this.productTypeId.trim(),
      product_category_id: this.categoryId.trim(),
      brand_id: this.brandId?.trim() || undefined,
      variants: [],
      attributes: [],
      seo: (this.seoMetaTitle || this.seoMetaDescription || this.seoMetaKeywords || this.seoSlug || this.seoCanonicalUrl) ? {
        meta_title: this.seoMetaTitle?.trim() || undefined,
        meta_description: this.seoMetaDescription?.trim() || undefined,
        meta_keywords: this.seoMetaKeywords?.trim() || undefined,
        slug: this.seoSlug?.trim() || undefined,
        canonical_url: this.seoCanonicalUrl?.trim() || undefined
      } : undefined
    };

    this.saving = true;
    this.productService.createProduct(body).subscribe({
      next: () => {
        this.saving = false;
        this.saveSuccess = 'Produit créé avec succès.';
        this.router.navigate(['/admin/products']);
      },
      error: (err) => {
        this.saving = false;
        this.saveError = err?.error?.message || 'Erreur lors de la création du produit.';
      }
    });
  }

  private updateProduct(): void {
    // Construction du payload pour la mise à jour selon l'endpoint PUT /api/v1/products/products/{product_id}
    // Selon la doc: label, description, price, sku, barcode, weight, dimensions, is_featured,
    // main_image_url, add_media_ids, remove_media_ids, product_category_id, brand_id, seo
    const body: any = {
      label: this.label?.trim() || undefined,
      description: this.description?.trim() || undefined,
      price: this.price || undefined,
      sku: this.sku?.trim() || undefined,
      barcode: this.barcode?.trim() || undefined,
      weight: this.weight || undefined,
      dimensions: this.dimensions?.trim() || undefined,
      is_featured: this.isFeatured,
      main_image_url: this.mainImageUrl?.trim() || undefined,
      add_media_ids: this.mediaIds.length > 0 ? this.mediaIds : undefined,
      remove_media_ids: undefined, // TODO: gérer la suppression de médias si nécessaire
      product_category_id: this.categoryId?.trim() || undefined,
      brand_id: this.brandId?.trim() || undefined,
      seo: (this.seoMetaTitle || this.seoMetaDescription || this.seoMetaKeywords || this.seoSlug || this.seoCanonicalUrl) ? {
        meta_title: this.seoMetaTitle?.trim() || undefined,
        meta_description: this.seoMetaDescription?.trim() || undefined,
        meta_keywords: this.seoMetaKeywords?.trim() || undefined,
        slug: this.seoSlug?.trim() || undefined,
        canonical_url: this.seoCanonicalUrl?.trim() || undefined
      } : undefined
    };

    // Nettoyer le body : retirer les propriétés undefined
    Object.keys(body).forEach(key => {
      if (body[key] === undefined) {
        delete body[key];
      }
    });

    this.saving = true;
    this.productService.updateProduct(this.productId!, body).subscribe({
      next: (res) => {
        this.saving = false;
        if (res && res.status === 'SUCCESS') {
          this.saveSuccess = 'Produit mis à jour avec succès.';
        } else {
          this.saveSuccess = 'Produit mis à jour avec succès.';
        }
      },
      error: (err) => {
        this.saving = false;
        this.saveError = err?.error?.message || 'Erreur lors de la mise à jour du produit.';
      }
    });
  }
}


