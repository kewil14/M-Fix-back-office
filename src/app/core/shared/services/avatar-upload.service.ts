import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, share } from 'rxjs';
import { API_URLS } from '../../config/app.url.config';

export interface MediaResponse {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize?: number;
  cdnUrl?: string;
  entityType?: string;
  entityId?: string;
  altText?: string;
  displayOrder?: number;
  isDefault?: boolean;
  workspaceId?: string;
  uploadedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UploadAvatarOptions {
  entityType?: 'PRODUCT' | 'PRODUCT_VARIANT' | 'PRODUCT_CATEGORY' | 'PRODUCT_TYPE' | 'BRAND' | 'SHOP' | 'REPAIR' | 'ORDER' | 'USER' | string;
  entityId?: string;
  workspaceId?: string;
  altText?: string;
}

@Injectable({ providedIn: 'root' })
export class AvatarUploadService {

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Uploader un avatar
   * @param file Le fichier image à uploader
   * @param options Paramètres complémentaires pour le média
   * @returns Observable<MediaResponse>
   */
  uploadAvatar(file: File, options?: UploadAvatarOptions): Observable<MediaResponse> {
    const formData = new FormData();
    formData.append('file', file);

    let params = new HttpParams()
      .set('entityType', options?.entityType || 'USER')
      .set('workspaceId', options?.workspaceId || 'system');

    if (options?.entityId) {
      params = params.set('entityId', options.entityId);
    }
    if (options?.altText) {
      params = params.set('altText', options.altText);
    }

    return this.http.post<MediaResponse>(
      API_URLS.MEDIA_SERVICE_URL + `/api/v1/medias/upload`,
      formData,
      { params }
    ).pipe(share());
  }
}

