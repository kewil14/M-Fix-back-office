import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, Inject, Optional } from '@angular/core';
import { Observable, share, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_URLS } from 'src/app/core/config/app.url.config';
import { RequestResultDto } from '../dtos/request-result-dto.modal';
import { PermissionService } from './permission.service';

export interface ProductListItem {
  id: string;
  label: string;
  price: number;
  final_price?: number;
  state: string;
  sku: string;
  is_featured?: boolean;
  main_image_url?: string;
  average_rating?: number;
  stock_available?: number;
  has_promotion?: boolean;
  discount_percentage?: number;
  created_at?: string;
}

export interface ProductListResponse {
  success: boolean;
  message?: string;
  data: ProductListItem[];
  page?: number;
  page_size?: number;
  total?: number;
  total_pages?: number;
}

export interface ProductSearchParams {
  q?: string;
  category_id?: string;
  brand_id?: string;
  min_price?: number;
  max_price?: number;
  is_featured?: boolean;
  state?: string;
  in_stock?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
  workspace_id?: string;
  shop_id?: string;
}

export interface BrandListItem {
  id: string;
  label: string;
  description?: string;
  website?: string;
  logo_url?: string;
  products_count?: number;
  state?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryTreeItem {
  id: string;
  label: string;
  description?: string;
  slug?: string;
  parent_category_id?: string;
  depth?: number;
  path?: string;
  display_order?: number;
  state?: string;
  main_image_url?: string;
  product_count?: number;
  subcategories?: CategoryTreeItem[];
  created_at?: string;
  updated_at?: string;
}

export interface ProductDetail {
  id: string;
  label: string;
  description?: string;
  price: number;
  state: string;
  sku: string;
  barcode?: string;
  weight?: number;
  dimensions?: string;
  is_featured?: boolean;
  main_image_url?: string;
  media_ids?: string[];
  images?: { id: string; cdn_url: string; alt_text?: string; is_default?: boolean; display_order?: number }[];
  variants?: any[];
  attributes?: any[];
  category?: { id: string; label: string; slug?: string };
  brand?: { id: string; label: string; logo_url?: string };
  product_type_id?: string;
  shop_id?: string;
  workspace_id?: string; // Added workspace_id
  seo?: {
    id?: string;
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
    slug?: string;
    canonical_url?: string;
  };
  total_stock?: number;
  average_rating?: number;
  total_reviews?: number;
  created_at?: string;
  updated_at?: string;
}

export interface BrandDetail extends BrandListItem {
  images?: { id: string; cdn_url: string; alt_text?: string; is_default?: boolean; display_order?: number }[];
  top_products?: any[];
}

export interface CategoryDetail extends CategoryTreeItem {
  images?: { id: string; cdn_url: string; alt_text?: string; is_default?: boolean; display_order?: number }[];
  parent?: any;
  breadcrumb?: any[];
}

export interface ProductTypeListItem {
  id: string;
  label: string;
  description?: string;
  state?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TagListItem {
  id: string;
  label: string;
  slug: string;
  description?: string;
  state?: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private baseUrl = API_URLS.PRODUCT_SERVICE_URL;

  constructor(
    private http: HttpClient,
    @Optional() private permissionService?: PermissionService
  ) {}

  // --------- Produits ----------

  getProducts(params: ProductSearchParams = {}): Observable<ProductListResponse> {
    let httpParams = new HttpParams();

    // Ne passer workspace_id dans les requêtes que pour super admin et admin
    // Pour tous les autres rôles, le backend utilisera le workspace_id du token
    if (this.permissionService) {
      const isSuperAdmin = this.permissionService.isSuperAdmin();
      const isAdmin = this.permissionService.isAdmin();
      
      // Si l'utilisateur n'est ni super admin ni admin, ne pas passer workspace_id
      // Le backend utilisera automatiquement le workspace_id du token
      if (!isSuperAdmin && !isAdmin && params.workspace_id) {
        // Retirer workspace_id des params pour les non-admin
        delete params.workspace_id;
        console.log('[ProductService.getProducts] Removed workspace_id - user is not super admin/admin, backend will use token workspace_id');
      }
    }

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });

    // Par défaut, ne retourner que les produits ACTIFS si state n'est pas spécifié
    if (!params.state) {
      httpParams = httpParams.set('state', 'ACTIVE');
    }

    // Valeurs par défaut selon la doc
    if (!params.page) {
      httpParams = httpParams.set('page', '1');
    }
    if (!params.page_size) {
      httpParams = httpParams.set('page_size', '20');
    }
    if (!params.sort_by) {
      httpParams = httpParams.set('sort_by', 'created_at');
    }
    if (!params.sort_order) {
      httpParams = httpParams.set('sort_order', 'desc');
    }

    console.log('[ProductService.getProducts] Request params:', httpParams.toString());
    console.log('[ProductService.getProducts] Full params object:', params);

    return this.http
      .get<RequestResultDto<ProductListItem[]>>(`${this.baseUrl}/products/products`, { params: httpParams })
      .pipe(
        tap({
          next: (response) => {
            console.log('[ProductService.getProducts] ✅ Response received:', response);
            console.log('[ProductService.getProducts] Products count:', response?.data?.length || 0);
            if (response?.data) {
              console.log('[ProductService.getProducts] First product sample:', response.data[0]);
            }
          },
          error: (error) => {
            console.error('[ProductService.getProducts] ❌ Error:', error);
            console.error('[ProductService.getProducts] Error details:', error?.error);
            console.error('[ProductService.getProducts] Error status:', error?.status);
          }
        }),
        map((res: RequestResultDto<ProductListItem[]>) => {
          // Adapter la réponse au format ProductListResponse attendu par le composant
          if (res && res.status === 'SUCCESS') {
            const data = Array.isArray(res.data) ? res.data : [];
            return {
              success: true,
              data: data,
              total: data.length,
              page: params.page || 1,
              page_size: params.page_size || 20
            } as ProductListResponse;
          }
          return {
            success: false,
            data: [],
            total: 0,
            page: params.page || 1,
            page_size: params.page_size || 20
          } as ProductListResponse;
        }),
        share()
      );
  }

  getProductById(productId: string): Observable<RequestResultDto<ProductDetail>> {
    console.log('[ProductService.getProductById] Requesting product:', productId);
    return this.http
      .get<RequestResultDto<ProductDetail>>(`${this.baseUrl}/products/products/${productId}`)
      .pipe(
        tap({
          next: (response) => {
            console.log('[ProductService.getProductById] ✅ Response received:', response);
            if (response?.data) {
              console.log('[ProductService.getProductById] Product shop_id:', response.data.shop_id);
              console.log('[ProductService.getProductById] Product workspace (if available):', (response.data as any)?.workspace_id);
            }
          },
          error: (error) => {
            console.error('[ProductService.getProductById] ❌ Error:', error);
            console.error('[ProductService.getProductById] Error details:', error?.error);
          }
        }),
        share()
      );
  }

  createProduct(body: any): Observable<any> {
    console.log('[ProductService.createProduct] Creating product with body:', body);
    console.log('[ProductService.createProduct] Body shop_id:', body.shop_id);
    console.log('[ProductService.createProduct] Body workspace_id:', body.workspace_id);
    return this.http
      .post<any>(`${this.baseUrl}/products/products`, body)
      .pipe(
        tap({
          next: (response) => {
            console.log('[ProductService.createProduct] ✅ Response received:', response);
          },
          error: (error) => {
            console.error('[ProductService.createProduct] ❌ Error:', error);
            console.error('[ProductService.createProduct] Error details:', error?.error);
          }
        }),
        share()
      );
  }

  updateProduct(productId: string, body: any): Observable<RequestResultDto<any>> {
    console.log('[ProductService.updateProduct] Updating product:', productId);
    console.log('[ProductService.updateProduct] Body:', body);
    return this.http
      .put<RequestResultDto<any>>(`${this.baseUrl}/products/products/${productId}`, body)
      .pipe(
        tap({
          next: (response) => {
            console.log('[ProductService.updateProduct] ✅ Response received:', response);
          },
          error: (error) => {
            console.error('[ProductService.updateProduct] ❌ Error:', error);
            console.error('[ProductService.updateProduct] Error details:', error?.error);
          }
        }),
        share()
      );
  }

  deleteProduct(productId: string): Observable<RequestResultDto<any>> {
    console.log('[ProductService.deleteProduct] Deleting product:', productId);
    return this.http
      .delete<RequestResultDto<any>>(`${this.baseUrl}/products/products/${productId}`)
      .pipe(
        tap({
          next: (response) => {
            console.log('[ProductService.deleteProduct] ✅ Response received:', response);
          },
          error: (error) => {
            console.error('[ProductService.deleteProduct] ❌ Error:', error);
            console.error('[ProductService.deleteProduct] Error details:', error?.error);
          }
        }),
        share()
      );
  }

  updateProductState(productId: string, state: string, reason?: string): Observable<RequestResultDto<any>> {
    const body: { state: string; reason?: string } = { state };
    if (reason) {
      body.reason = reason;
    }
    return this.http
      .patch<RequestResultDto<any>>(`${this.baseUrl}/products/products/${productId}/state`, body)
      .pipe(share());
  }

  duplicateProduct(productId: string, options: {
    new_label: string;
    copy_stock?: boolean;
    copy_reviews?: boolean;
    copy_images?: boolean;
  }): Observable<RequestResultDto<any>> {
    const body: any = {
      new_label: options.new_label,
      copy_stock: options.copy_stock ?? false,
      copy_reviews: options.copy_reviews ?? false,
      copy_images: options.copy_images ?? true
    };
    return this.http
      .post<RequestResultDto<any>>(`${this.baseUrl}/products/products/${productId}/duplicate`, body)
      .pipe(share());
  }

  /**
   * Export products to CSV
   * @param params Filter parameters (same as search)
   */
  exportProductsCSV(params: {
    category_id?: string;
    brand_id?: string;
    state?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | 'DELETED';
    workspace_id?: string; // Ajouter le filtre workspace
  } = {}): Observable<Blob> {
    let httpParams = new HttpParams();
    
    if (params.category_id) {
      httpParams = httpParams.set('category_id', params.category_id);
    }
    if (params.brand_id) {
      httpParams = httpParams.set('brand_id', params.brand_id);
    }
    if (params.state) {
      httpParams = httpParams.set('state', params.state);
    }
    
    // Ne passer workspace_id que pour super admin et admin
    // Pour tous les autres rôles, le backend utilisera le workspace_id du token
    const isSuperAdmin = this.permissionService?.isSuperAdmin();
    const isAdmin = this.permissionService?.isAdmin();
    const finalWorkspaceId = (isSuperAdmin || isAdmin) ? params.workspace_id : undefined;
    
    if (finalWorkspaceId) {
      httpParams = httpParams.set('workspace_id', finalWorkspaceId);
      console.log('[ProductService.exportProducts] Adding workspace_id filter (super admin/admin only):', finalWorkspaceId);
    } else if (!isSuperAdmin && !isAdmin && params.workspace_id) {
      console.log('[ProductService.exportProducts] Not passing workspace_id - backend will use token workspace_id');
    }
    
    return this.http.get(
      `${this.baseUrl}/products/products/export`,
      {
        params: httpParams,
        responseType: 'blob',
        observe: 'body'
      }
    );
  }

  // --------- Marques ----------

  getBrands(params?: { workspaceId?: string; state?: string }): Observable<RequestResultDto<BrandListItem[]>> {
    let httpParams = new HttpParams();
    
    // Ne passer workspace_id que pour super admin et admin
    // Pour tous les autres rôles, le backend utilisera le workspace_id du token
    const isSuperAdmin = this.permissionService?.isSuperAdmin();
    const isAdmin = this.permissionService?.isAdmin();
    const finalWorkspaceId = (isSuperAdmin || isAdmin) ? (params?.workspaceId || undefined) : undefined;
    
    if (finalWorkspaceId) {
      httpParams = httpParams.set('workspace_id', finalWorkspaceId);
      console.log('[ProductService.getBrands] Adding workspace_id filter (super admin/admin only):', finalWorkspaceId);
    } else if (!isSuperAdmin && !isAdmin) {
      console.log('[ProductService.getBrands] Not passing workspace_id - backend will use token workspace_id');
    } else {
      console.warn('[ProductService.getBrands] ⚠️ No workspace_id provided - may return brands from all workspaces');
    }

    if (params?.state) {
      httpParams = httpParams.set('state', params.state);
    }
    
    console.log('[ProductService.getBrands] Request params:', httpParams.toString());
    
    return this.http
      // Selon la doc Product Service: endpoint GET /brands/brands
      .get<RequestResultDto<BrandListItem[]>>(`${this.baseUrl}/brands/brands`, { params: httpParams })
      .pipe(
        tap({
          next: (response) => {
            console.log('[ProductService.getBrands] ✅ Response received:', response);
            console.log('[ProductService.getBrands] Brands count:', response?.data?.length || 0);
          },
          error: (error) => {
            console.error('[ProductService.getBrands] ❌ Error:', error);
            console.error('[ProductService.getBrands] Error details:', error?.error);
          }
        }),
        share()
      );
  }

  createBrand(body: {
    label: string;
    description?: string;
    website?: string;
    logo_url?: string;
    media_ids?: string[];
  }): Observable<any> {
    return this.http
      // Selon la doc Product Service: endpoint POST /brands/brands
      .post<any>(`${this.baseUrl}/brands/brands`, body)
      .pipe(share());
  }

  getBrandById(brandId: string): Observable<RequestResultDto<BrandDetail>> {
    return this.http
      .get<RequestResultDto<BrandDetail>>(`${this.baseUrl}/brands/brands/${brandId}`)
      .pipe(share());
  }

  updateBrand(brandId: string, body: {
    label?: string;
    description?: string;
    website?: string;
    state?: string;
    logo_url?: string;
    add_media_ids?: string[];
    remove_media_ids?: string[];
  }): Observable<RequestResultDto<BrandDetail>> {
    return this.http
      .put<RequestResultDto<BrandDetail>>(`${this.baseUrl}/brands/brands/${brandId}`, body)
      .pipe(share());
  }

  deleteBrand(brandId: string): Observable<RequestResultDto<any>> {
    return this.http
      .delete<RequestResultDto<any>>(`${this.baseUrl}/brands/brands/${brandId}`)
      .pipe(share());
  }

  // --------- Catégories ----------

  getCategoriesTree(params?: { workspaceId?: string; state?: string }): Observable<RequestResultDto<CategoryTreeItem[]>> {
    let httpParams = new HttpParams();
    
    // Ne passer workspace_id que pour super admin et admin
    // Pour tous les autres rôles, le backend utilisera le workspace_id du token
    const isSuperAdmin = this.permissionService?.isSuperAdmin();
    const isAdmin = this.permissionService?.isAdmin();
    const finalWorkspaceId = (isSuperAdmin || isAdmin) ? (params?.workspaceId || undefined) : undefined;
    
    if (finalWorkspaceId) {
      httpParams = httpParams.set('workspace_id', finalWorkspaceId);
      console.log('[ProductService.getCategoriesTree] Adding workspace_id filter (super admin/admin only):', finalWorkspaceId);
    } else if (!isSuperAdmin && !isAdmin) {
      console.log('[ProductService.getCategoriesTree] Not passing workspace_id - backend will use token workspace_id');
    } else {
      console.warn('[ProductService.getCategoriesTree] ⚠️ No workspace_id provided - may return categories from all workspaces');
    }

    if (params?.state) {
      httpParams = httpParams.set('state', params.state);
    }
    
    console.log('[ProductService.getCategoriesTree] Request params:', httpParams.toString());
    
    return this.http
      // Selon la doc: GET /categories/categories (arbre hiérarchique)
      .get<RequestResultDto<CategoryTreeItem[]>>(`${this.baseUrl}/categories/categories`, { params: httpParams })
      .pipe(
        tap({
          next: (response) => {
            console.log('[ProductService.getCategoriesTree] ✅ Response received:', response);
            console.log('[ProductService.getCategoriesTree] Categories count:', response?.data?.length || 0);
          },
          error: (error) => {
            console.error('[ProductService.getCategoriesTree] ❌ Error:', error);
            console.error('[ProductService.getCategoriesTree] Error details:', error?.error);
          }
        }),
        share()
      );
  }

  createCategory(body: {
    label: string;
    description?: string;
    parent_category_id?: string;
    display_order?: number;
    main_image_url?: string;
    media_ids?: string[];
  }): Observable<any> {
    return this.http
      // Selon la doc: POST /categories/categories
      .post<any>(`${this.baseUrl}/categories/categories`, body)
      .pipe(share());
  }

  getCategoryById(categoryId: string): Observable<RequestResultDto<CategoryDetail>> {
    return this.http
      .get<RequestResultDto<CategoryDetail>>(`${this.baseUrl}/categories/categories/${categoryId}`)
      .pipe(share());
  }

  updateCategory(categoryId: string, body: {
    label?: string;
    description?: string;
    display_order?: number;
    state?: string;
    main_image_url?: string;
    add_media_ids?: string[];
    remove_media_ids?: string[];
  }): Observable<RequestResultDto<CategoryDetail>> {
    return this.http
      .put<RequestResultDto<CategoryDetail>>(`${this.baseUrl}/categories/categories/${categoryId}`, body)
      .pipe(share());
  }

  deleteCategory(categoryId: string, force: boolean = false): Observable<RequestResultDto<any>> {
    let httpParams = new HttpParams().set('force', String(force));
    return this.http
      .delete<RequestResultDto<any>>(`${this.baseUrl}/categories/categories/${categoryId}`, { params: httpParams })
      .pipe(share());
  }

  // --------- Stock ----------

  updateStock(variantId: string, shopId: string, body: { quantity: number; type: string; note?: string }): Observable<any> {
    const params = new HttpParams().set('shop_id', shopId);
    return this.http
      .put<any>(`${this.baseUrl}/stock/variants/${variantId}`, body, { params })
      .pipe(share());
  }

  reserveStock(items: Array<{ variant_id: string; quantity: number; shop_id: string }>): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrl}/stock/reserve`, { items })
      .pipe(share());
  }

  confirmStock(orderId: string, body: any[]): Observable<any> {
    const params = new HttpParams().set('order_id', orderId);
    return this.http
      .post<any>(`${this.baseUrl}/stock/confirm`, body, { params })
      .pipe(share());
  }

  releaseStock(orderId: string, body: any[]): Observable<any> {
    const params = new HttpParams().set('order_id', orderId);
    return this.http
      .post<any>(`${this.baseUrl}/stock/release`, body, { params })
      .pipe(share());
  }

  syncStock(variantId: string, sourceShopId: string, quantity: number, targetShopIds: string[]): Observable<any> {
    const params = new HttpParams()
      .set('variant_id', variantId)
      .set('source_shop_id', sourceShopId)
      .set('quantity', quantity.toString());
    return this.http
      .post<any>(`${this.baseUrl}/stock/sync`, targetShopIds, { params })
      .pipe(share());
  }

  checkStock(body: any[]): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrl}/stock/check`, body)
      .pipe(share());
  }

  getStockList(params?: { shop_id?: string; variant_id?: string; page?: number; page_size?: number; workspace_id?: string }): Observable<RequestResultDto<any>> {
    let httpParams = new HttpParams();
    if (params?.shop_id) httpParams = httpParams.set('shop_id', params.shop_id);
    if (params?.variant_id) httpParams = httpParams.set('variant_id', params.variant_id);
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.page_size) httpParams = httpParams.set('page_size', params.page_size.toString());
    
    // Ne passer workspace_id que pour super admin et admin
    // Pour tous les autres rôles, le backend utilisera le workspace_id du token
    const isSuperAdmin = this.permissionService?.isSuperAdmin();
    const isAdmin = this.permissionService?.isAdmin();
    const finalWorkspaceId = (isSuperAdmin || isAdmin) ? (params?.workspace_id || undefined) : undefined;
    
    if (finalWorkspaceId) {
      httpParams = httpParams.set('workspace_id', finalWorkspaceId);
      console.log('[ProductService.getStockList] Adding workspace_id filter (super admin/admin only):', finalWorkspaceId);
    } else if (!isSuperAdmin && !isAdmin && params?.workspace_id) {
      console.log('[ProductService.getStockList] Not passing workspace_id - backend will use token workspace_id');
    }

    return this.http
      .get<RequestResultDto<any>>(`${this.baseUrl}/stock`, { params: httpParams })
      .pipe(share());
  }

  getStockByVariantAndShop(variantId: string, shopId: string): Observable<RequestResultDto<any>> {
    const params = new HttpParams()
      .set('variant_id', variantId)
      .set('shop_id', shopId);
    return this.http
      .get<RequestResultDto<any>>(`${this.baseUrl}/stock`, { params })
      .pipe(share());
  }

  // --------- Variants ----------

  getVariantsForProduct(productId: string): Observable<RequestResultDto<any>> {
    return this.http
      .get<RequestResultDto<any>>(`${this.baseUrl}/products/${productId}/variants`)
      .pipe(share());
  }

  createVariant(productId: string, body: any): Observable<RequestResultDto<any>> {
    return this.http
      .post<RequestResultDto<any>>(`${this.baseUrl}/products/${productId}/variants`, body)
      .pipe(share());
  }

  updateVariant(productId: string, variantId: string, body: any): Observable<RequestResultDto<any>> {
    return this.http
      .put<RequestResultDto<any>>(`${this.baseUrl}/products/${productId}/variants/${variantId}`, body)
      .pipe(share());
  }

  deleteVariant(productId: string, variantId: string): Observable<RequestResultDto<any>> {
    return this.http
      .delete<RequestResultDto<any>>(`${this.baseUrl}/products/${productId}/variants/${variantId}`)
      .pipe(share());
  }

  // --------- Promotions ----------

  createPromotion(body: any): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrl}/promotions`, body)
      .pipe(share());
  }

  // --------- Analytics ----------

  getAnalyticsReport(params: { start_date: string; end_date: string; shop_id: string; metrics?: string }): Observable<any> {
    let httpParams = new HttpParams()
      .set('start_date', params.start_date)
      .set('end_date', params.end_date)
      .set('shop_id', params.shop_id); // shop_id est obligatoire

    if (params.metrics) {
      httpParams = httpParams.set('metrics', params.metrics);
    }

    return this.http
      .get<any>(`${this.baseUrl}/analytics/report`, { params: httpParams })
      .pipe(share());
  }

  // --------- Product Types ----------

  getProductTypes(params?: { state?: string; page?: number; page_size?: number; workspace_id?: string }): Observable<RequestResultDto<any>> {
    let httpParams = new HttpParams();
    if (params?.state) httpParams = httpParams.set('state', params.state);
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.page_size) httpParams = httpParams.set('page_size', params.page_size.toString());
    
    // Ne passer workspace_id que pour super admin et admin
    // Pour tous les autres rôles, le backend utilisera le workspace_id du token
    const isSuperAdmin = this.permissionService?.isSuperAdmin();
    const isAdmin = this.permissionService?.isAdmin();
    const finalWorkspaceId = (isSuperAdmin || isAdmin) ? (params?.workspace_id || undefined) : undefined;
    
    if (finalWorkspaceId) {
      httpParams = httpParams.set('workspace_id', finalWorkspaceId);
      console.log('[ProductService.getProductTypes] Adding workspace_id filter (super admin/admin only):', finalWorkspaceId);
    } else if (!isSuperAdmin && !isAdmin) {
      console.log('[ProductService.getProductTypes] Not passing workspace_id - backend will use token workspace_id');
    } else {
      console.warn('[ProductService.getProductTypes] ⚠️ No workspace_id provided - may return product types from all workspaces');
    }
    
    console.log('[ProductService.getProductTypes] Request params:', httpParams.toString());

    return this.http
      .get<RequestResultDto<any>>(`${this.baseUrl}/product-types`, { params: httpParams })
      .pipe(
        tap({
          next: (response) => {
            console.log('[ProductService.getProductTypes] ✅ Response received:', response);
            console.log('[ProductService.getProductTypes] Product types count:', response?.data?.length || 0);
          },
          error: (error) => {
            console.error('[ProductService.getProductTypes] ❌ Error:', error);
            console.error('[ProductService.getProductTypes] Error details:', error?.error);
          }
        }),
        share()
      );
  }

  createProductType(body: {
    label: string;
    description?: string;
    state?: string;
  }): Observable<RequestResultDto<any>> {
    return this.http
      .post<RequestResultDto<any>>(`${this.baseUrl}/product-types`, body)
      .pipe(share());
  }

  getProductTypeById(typeId: string): Observable<RequestResultDto<ProductTypeListItem>> {
    return this.http
      .get<RequestResultDto<ProductTypeListItem>>(`${this.baseUrl}/product-types/${typeId}`)
      .pipe(share());
  }

  updateProductType(typeId: string, body: {
    label: string;
    description?: string;
    state?: string;
  }): Observable<RequestResultDto<ProductTypeListItem>> {
    return this.http
      .put<RequestResultDto<ProductTypeListItem>>(`${this.baseUrl}/product-types/${typeId}`, body)
      .pipe(share());
  }

  deleteProductType(typeId: string): Observable<RequestResultDto<any>> {
    return this.http
      .delete<RequestResultDto<any>>(`${this.baseUrl}/product-types/${typeId}`)
      .pipe(share());
  }

  // --------- Tags ----------

  getTags(params?: { state?: string; workspaceId?: string }): Observable<RequestResultDto<TagListItem[]>> {
    let httpParams = new HttpParams();
    if (params?.state) httpParams = httpParams.set('state', params.state);
    
    // Ne passer workspace_id que pour super admin et admin
    // Pour tous les autres rôles, le backend utilisera le workspace_id du token
    const isSuperAdmin = this.permissionService?.isSuperAdmin();
    const isAdmin = this.permissionService?.isAdmin();
    const finalWorkspaceId = (isSuperAdmin || isAdmin) ? (params?.workspaceId || undefined) : undefined;
    
    if (finalWorkspaceId) {
      httpParams = httpParams.set('workspace_id', finalWorkspaceId);
      console.log('[ProductService.getTags] Adding workspace_id filter (super admin/admin only):', finalWorkspaceId);
    } else if (!isSuperAdmin && !isAdmin) {
      console.log('[ProductService.getTags] Not passing workspace_id - backend will use token workspace_id');
    } else {
      console.warn('[ProductService.getTags] ⚠️ No workspace_id provided - may return tags from all workspaces');
    }

    return this.http
      .get<RequestResultDto<TagListItem[]>>(`${this.baseUrl}/tags`, { params: httpParams })
      .pipe(share());
  }

  createTag(body: {
    label: string;
    slug: string;
    description?: string;
    state?: string;
  }): Observable<RequestResultDto<TagListItem>> {
    return this.http
      .post<RequestResultDto<TagListItem>>(`${this.baseUrl}/tags`, body)
      .pipe(share());
  }

  getTagById(tagId: string): Observable<RequestResultDto<TagListItem>> {
    return this.http
      .get<RequestResultDto<TagListItem>>(`${this.baseUrl}/tags/${tagId}`)
      .pipe(share());
  }

  updateTag(tagId: string, body: {
    label?: string;
    slug?: string;
    description?: string;
    state?: string;
  }): Observable<RequestResultDto<TagListItem>> {
    return this.http
      .put<RequestResultDto<TagListItem>>(`${this.baseUrl}/tags/${tagId}`, body)
      .pipe(share());
  }

  deleteTag(tagId: string): Observable<RequestResultDto<any>> {
    return this.http
      .delete<RequestResultDto<any>>(`${this.baseUrl}/tags/${tagId}`)
      .pipe(share());
  }

  addTagsToProduct(productId: string, tagIds: string[]): Observable<RequestResultDto<any>> {
    return this.http
      .post<RequestResultDto<any>>(`${this.baseUrl}/tags/${productId}/tags`, tagIds)
      .pipe(share());
  }
}


