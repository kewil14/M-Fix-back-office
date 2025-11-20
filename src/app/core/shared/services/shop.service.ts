import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, share } from 'rxjs';
import { API_URLS } from '../../config/app.url.config';
import { RequestResultDto } from '../dtos/request-result-dto.modal';
import { 
  ShopResponseDto, 
  ShopListResponseDto, 
  ShopListRequestDto,
  CreateShopDto,
  UpdateShopDto
} from '../dtos/shop-response-dto';

@Injectable({ providedIn: 'root' })
export class ShopService {

  constructor(
    private http: HttpClient
  ) { }

  getShops(filters: ShopListRequestDto): Observable<RequestResultDto<ShopListResponseDto>> {
    let params = new HttpParams();
    
    if (filters.workspaceId) params = params.set('dto.workspaceId', filters.workspaceId);
    if (filters.search) params = params.set('dto.search', filters.search);
    if (filters.isActive !== undefined) params = params.set('dto.isActive', filters.isActive.toString());
    if (filters.page !== undefined) params = params.set('dto.page', filters.page.toString());
    if (filters.size !== undefined) params = params.set('dto.size', filters.size.toString());
    if (filters.sortBy) params = params.set('dto.sortBy', filters.sortBy);
    if (filters.sortDirection) params = params.set('dto.sortDirection', filters.sortDirection);

    return this.http.get<RequestResultDto<ShopListResponseDto>>(
      API_URLS.CUSTOMERS_URL + `/shops`,
      { params }
    ).pipe(share());
  }

  getShopById(shopId: string): Observable<RequestResultDto<ShopResponseDto>> {
    return this.http.get<RequestResultDto<ShopResponseDto>>(
      API_URLS.CUSTOMERS_URL + `/shops/${shopId}`
    ).pipe(share());
  }

  getShopsByWorkspace(workspaceId: string): Observable<RequestResultDto<ShopListResponseDto>> {
    const filters: ShopListRequestDto = {
      workspaceId: workspaceId,
      page: 0,
      size: 1000
    };
    return this.getShops(filters);
  }

  createShop(createShopDto: CreateShopDto): Observable<RequestResultDto<ShopResponseDto>> {
    return this.http.post<RequestResultDto<ShopResponseDto>>(
      API_URLS.CUSTOMERS_URL + `/shops`,
      createShopDto
    ).pipe(share());
  }

  updateShop(shopId: string, updateShopDto: UpdateShopDto): Observable<RequestResultDto<ShopResponseDto>> {
    return this.http.put<RequestResultDto<ShopResponseDto>>(
      API_URLS.CUSTOMERS_URL + `/shops/${shopId}`,
      updateShopDto
    ).pipe(share());
  }

  deleteShop(shopId: string): Observable<RequestResultDto<string>> {
    return this.http.delete<RequestResultDto<string>>(
      API_URLS.CUSTOMERS_URL + `/shops/${shopId}`
    ).pipe(share());
  }

  reactivateShop(shopId: string): Observable<RequestResultDto<string>> {
    return this.http.patch<RequestResultDto<string>>(
      API_URLS.CUSTOMERS_URL + `/shops/${shopId}/reactivate`,
      {}
    ).pipe(share());
  }
}

