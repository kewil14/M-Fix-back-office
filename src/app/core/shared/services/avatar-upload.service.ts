import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, share } from 'rxjs';
import { API_URLS } from '../../config/app.url.config';
import { RequestResultDto } from '../dtos/request-result-dto.modal';

export interface AvatarUploadResponse {
  url: string;
}

@Injectable({ providedIn: 'root' })
export class AvatarUploadService {

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Uploader un avatar
   * @param file Le fichier image à uploader
   * @returns Observable<RequestResultDto<AvatarUploadResponse>>
   */
  uploadAvatar(file: File): Observable<RequestResultDto<AvatarUploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<RequestResultDto<AvatarUploadResponse>>(
      API_URLS.CUSTOMERS_URL + `/files/upload`,
      formData
    ).pipe(share());
  }
}

