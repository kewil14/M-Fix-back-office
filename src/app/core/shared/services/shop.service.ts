import { HttpClient } from '@angular/common/http';
import { Injectable, Optional } from '@angular/core';
import { Observable, share, map } from 'rxjs';
import { API_URLS } from '../../config/app.url.config';
import { RequestResultDto } from '../dtos/request-result-dto.modal';
import { 
  ShopResponseDto, 
  ShopListResponseDto, 
  ShopListRequestDto,
  CreateShopDto,
  UpdateShopDto
} from '../dtos/shop-response-dto';
import { PermissionService } from './permission.service';

@Injectable({ providedIn: 'root' })
export class ShopService {

  constructor(
    private http: HttpClient,
    @Optional() private permissionService?: PermissionService
  ) { }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  private resolveWorkspaceId(provided?: string): string | null {
    const isAdmin = this.permissionService?.isAdmin?.() || false;
    const isSuperAdmin = this.permissionService?.isSuperAdmin?.() || false;

    // Ne passer workspaceId que pour super admin et admin
    // Pour tous les autres rôles, le backend utilisera le workspace_id du token
    if (!isAdmin && !isSuperAdmin) {
      return null; // Ne pas passer workspace_id, le backend utilisera celui du token
    }

    // Admin / SuperAdmin : respecter le workspace passé en argument, sinon pas de filtre
    return provided || null;
  }

  getShops(workspaceId?: string, filters?: ShopListRequestDto): Observable<RequestResultDto<ShopResponseDto[]>> {
    const effectiveWorkspaceId = this.resolveWorkspaceId(workspaceId);
    const endpoint = effectiveWorkspaceId
      ? `/api/shops/${workspaceId}/shops`
      : `/api/shops`;
    
    return this.http.get<RequestResultDto<ShopResponseDto[]>>(
      API_URLS.WORKSPACE_SERVICE_URL + endpoint
    ).pipe(
      map((data: RequestResultDto<ShopResponseDto[]>) => {
        if (data.status === 'SUCCESS' && data.data) {
          let shops = Array.isArray(data.data) ? [...data.data] : [];

          const workspaceFilter = effectiveWorkspaceId || filters?.workspaceId;
          if (workspaceFilter) {
            shops = shops.filter(shop => shop.workspaceId === workspaceFilter);
          }

          if (filters) {
            // Filtrer par statut actif/inactif
            if (filters.isActive !== undefined) {
              shops = shops.filter(shop => shop.isActive === filters.isActive);
            }
            
            // Filtrer par recherche
            if (filters.search) {
              const searchLower = filters.search.toLowerCase();
              shops = shops.filter(shop => 
                shop.name.toLowerCase().includes(searchLower) ||
                shop.email?.toLowerCase().includes(searchLower) ||
                shop.city?.toLowerCase().includes(searchLower) ||
                shop.code?.toLowerCase().includes(searchLower)
              );
            }
            
            // Trier les résultats
            if (filters.sortBy) {
              shops.sort((a, b) => {
                const sortField = filters.sortBy || 'createdAt';
                let aValue = this.getNestedValue(a, sortField);
                let bValue = this.getNestedValue(b, sortField);
                
                // Gérer les valeurs null/undefined
                if (aValue === null || aValue === undefined) return 1;
                if (bValue === null || bValue === undefined) return -1;
                
                // Convertir les dates string en Date si nécessaire
                if (sortField.includes('Date') || sortField.includes('At')) {
                  if (typeof aValue === 'string') {
                    aValue = new Date(aValue);
                  }
                  if (typeof bValue === 'string') {
                    bValue = new Date(bValue);
                  }
                }
                
                let comparison = 0;
                if (aValue instanceof Date && bValue instanceof Date) {
                  comparison = aValue.getTime() - bValue.getTime();
                } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                  comparison = aValue - bValue;
                } else if (typeof aValue === 'string' && typeof bValue === 'string') {
                  comparison = aValue.localeCompare(bValue, undefined, { numeric: true, sensitivity: 'base' });
                } else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
                  comparison = aValue === bValue ? 0 : (aValue ? 1 : -1);
                } else {
                  comparison = String(aValue).localeCompare(String(bValue), undefined, { numeric: true });
                }
                
                return filters.sortDirection === 'asc' ? comparison : -comparison;
              });
            }
          }

          data.data = shops;
        }
        return data;
      }),
      share()
    );
  }

  getShopById(workspaceId: string, shopId: string): Observable<RequestResultDto<ShopResponseDto>> {
    const effectiveWorkspaceId = this.resolveWorkspaceId(workspaceId) || workspaceId;
    if (!effectiveWorkspaceId || !shopId) {
      throw new Error('workspaceId and shopId are required');
    }
    
    return this.http.get<RequestResultDto<ShopResponseDto>>(
      API_URLS.WORKSPACE_SERVICE_URL + `/api/shops/${effectiveWorkspaceId}/shops/${shopId}`
    ).pipe(share());
  }

  getShopsByWorkspace(workspaceId: string): Observable<RequestResultDto<ShopResponseDto[]>> {
    // Pour les WORKSPACE_ADMIN, passer workspaceId dans les filters pour que le filtrage fonctionne
    return this.getShops(workspaceId, { workspaceId: workspaceId });
  }

  createShop(workspaceId: string, createShopDto: CreateShopDto): Observable<RequestResultDto<ShopResponseDto>> {
    const effectiveWorkspaceId = this.resolveWorkspaceId(workspaceId) || workspaceId;
    if (!effectiveWorkspaceId) {
      throw new Error('workspaceId is required');
    }
    
    const shopDto: any = {
      name: createShopDto.name,
      address: createShopDto.address,
      city: createShopDto.city,
      postalCode: createShopDto.postalCode,
      country: createShopDto.country,
      phone: createShopDto.phone || createShopDto.phoneNumber,
      email: createShopDto.email,
      description: createShopDto.description,
      latitude: createShopDto.latitude,
      longitude: createShopDto.longitude
    };
    
    return this.http.post<RequestResultDto<ShopResponseDto>>(
      API_URLS.WORKSPACE_SERVICE_URL + `/api/shops/${effectiveWorkspaceId}/shops`,
      shopDto
    ).pipe(share());
  }

  updateShop(workspaceId: string, shopId: string, updateShopDto: UpdateShopDto): Observable<RequestResultDto<ShopResponseDto>> {
    const effectiveWorkspaceId = this.resolveWorkspaceId(workspaceId) || workspaceId;
    if (!effectiveWorkspaceId || !shopId) {
      throw new Error('workspaceId and shopId are required');
    }
    
    const shopDto: any = {
      name: updateShopDto.name,
      address: updateShopDto.address,
      city: updateShopDto.city,
      postalCode: updateShopDto.postalCode,
      country: updateShopDto.country,
      phone: updateShopDto.phone || updateShopDto.phoneNumber,
      email: updateShopDto.email,
      description: updateShopDto.description,
      openingHours: updateShopDto.openingHours
    };
    
    return this.http.put<RequestResultDto<ShopResponseDto>>(
      API_URLS.WORKSPACE_SERVICE_URL + `/api/shops/${effectiveWorkspaceId}/shops/${shopId}`,
      shopDto
    ).pipe(share());
  }

  deleteShop(workspaceId: string, shopId: string): Observable<RequestResultDto<string>> {
    const effectiveWorkspaceId = this.resolveWorkspaceId(workspaceId) || workspaceId;
    if (!effectiveWorkspaceId || !shopId) {
      throw new Error('workspaceId and shopId are required');
    }
    
    return this.http.delete<RequestResultDto<string>>(
      API_URLS.WORKSPACE_SERVICE_URL + `/api/shops/${effectiveWorkspaceId}/shops/${shopId}`
    ).pipe(share());
  }

  deactivateShop(workspaceId: string, shopId: string): Observable<RequestResultDto<string>> {
    const effectiveWorkspaceId = this.resolveWorkspaceId(workspaceId) || workspaceId;
    if (!effectiveWorkspaceId || !shopId) {
      throw new Error('workspaceId and shopId are required');
    }
    
    return this.http.put<RequestResultDto<string>>(
      API_URLS.WORKSPACE_SERVICE_URL + `/api/shops/${effectiveWorkspaceId}/shops/${shopId}/deactivate`,
      {}
    ).pipe(share());
  }

  activateShop(workspaceId: string, shopId: string): Observable<RequestResultDto<string>> {
    const effectiveWorkspaceId = this.resolveWorkspaceId(workspaceId) || workspaceId;
    if (!effectiveWorkspaceId || !shopId) {
      throw new Error('workspaceId and shopId are required');
    }
    
    return this.http.put<RequestResultDto<string>>(
      API_URLS.WORKSPACE_SERVICE_URL + `/api/shops/${effectiveWorkspaceId}/shops/${shopId}/activate`,
      {}
    ).pipe(share());
  }

  reactivateShop(workspaceId: string, shopId: string): Observable<RequestResultDto<string>> {
    return this.activateShop(workspaceId, shopId);
  }

  /**
   * Export shops to CSV
   * @param workspaceId Workspace ID (required)
   */
  exportShops(workspaceId: string): Observable<Blob> {
    const effectiveWorkspaceId = this.resolveWorkspaceId(workspaceId) || workspaceId;
    if (!effectiveWorkspaceId) {
      throw new Error('workspaceId is required');
    }
    
    return this.http.get(
      API_URLS.WORKSPACE_SERVICE_URL + `/api/shops/${effectiveWorkspaceId}/shops/export`,
      { 
        responseType: 'blob',
        observe: 'body'
      }
    );
  }

  /**
   * Import shops from CSV
   * @param workspaceId Workspace ID (required)
   * @param file CSV file to import
   */
  importShops(workspaceId: string, file: File): Observable<RequestResultDto<any>> {
    const effectiveWorkspaceId = this.resolveWorkspaceId(workspaceId) || workspaceId;
    if (!effectiveWorkspaceId) {
      throw new Error('workspaceId is required');
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<RequestResultDto<any>>(
      API_URLS.WORKSPACE_SERVICE_URL + `/api/shops/${effectiveWorkspaceId}/shops/import`,
      formData
    ).pipe(share());
  }
}

