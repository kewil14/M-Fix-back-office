import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, share } from 'rxjs';
import { API_URLS } from '../../config/app.url.config';
import { RequestResultDto } from '../dtos/request-result-dto.modal';
import { CreateAdminDto } from '../dtos/create-admin-dto.modal';
import { AdminListRequestDto } from '../dtos/admin-list-request-dto';
import { UpdateAdminDto } from '../dtos/update-admin-dto';
import { EmployeeListResponseDto, EmployeeResponseDto } from '../dtos/employee-response-dto';

@Injectable({ providedIn: 'root' })
export class AdminService {

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Récupérer la liste paginée des administrateurs avec filtres
   * @param filters Les filtres de recherche
   * @returns Observable<RequestResultDto<EmployeeListResponseDto>>
   */
  findAllAdmins(filters: AdminListRequestDto): Observable<RequestResultDto<EmployeeListResponseDto>> {
    let params = new HttpParams();
    
    if (filters.isActive !== undefined) params = params.set('dto.isActive', filters.isActive.toString());
    if (filters.isSuperAdmin !== undefined) params = params.set('dto.isSuperAdmin', filters.isSuperAdmin.toString());
    if (filters.search) params = params.set('dto.search', filters.search);
    if (filters.page !== undefined) params = params.set('dto.page', filters.page.toString());
    if (filters.size !== undefined) params = params.set('dto.size', filters.size.toString());
    if (filters.sortBy) params = params.set('dto.sortBy', filters.sortBy);
    if (filters.sortDirection) params = params.set('dto.sortDirection', filters.sortDirection);

    return this.http.get<RequestResultDto<EmployeeListResponseDto>>(
      API_URLS.CUSTOMERS_URL + `/auth/admins`,
      { params }
    ).pipe(share());
  }

  /**
   * Récupérer un administrateur par son ID
   * @param adminId L'identifiant de l'administrateur
   * @returns Observable<RequestResultDto<EmployeeResponseDto>>
   */
  findAdminById(adminId: string): Observable<RequestResultDto<EmployeeResponseDto>> {
    return this.http.get<RequestResultDto<EmployeeResponseDto>>(
      API_URLS.CUSTOMERS_URL + `/auth/admins/${adminId}`
    ).pipe(share());
  }

  /**
   * Créer un nouvel administrateur
   * @param createAdminDto Les données de l'administrateur
   * @returns Observable<RequestResultDto<EmployeeResponseDto>>
   */
  createAdmin(createAdminDto: CreateAdminDto): Observable<RequestResultDto<EmployeeResponseDto>> {
    return this.http.post<RequestResultDto<EmployeeResponseDto>>(
      API_URLS.CUSTOMERS_URL + `/auth/admins`,
      createAdminDto
    ).pipe(share());
  }

  /**
   * Mettre à jour un administrateur
   * @param adminId L'identifiant de l'administrateur
   * @param updateAdminDto Les données à mettre à jour
   * @returns Observable<RequestResultDto<EmployeeResponseDto>>
   */
  updateAdmin(adminId: string, updateAdminDto: UpdateAdminDto): Observable<RequestResultDto<EmployeeResponseDto>> {
    return this.http.put<RequestResultDto<EmployeeResponseDto>>(
      API_URLS.CUSTOMERS_URL + `/auth/admins/${adminId}`,
      updateAdminDto
    ).pipe(share());
  }

  /**
   * Désactiver un administrateur (soft delete)
   * @param adminId L'identifiant de l'administrateur
   * @returns Observable<RequestResultDto<string>>
   */
  deleteAdmin(adminId: string): Observable<RequestResultDto<string>> {
    return this.http.delete<RequestResultDto<string>>(
      API_URLS.CUSTOMERS_URL + `/auth/admins/${adminId}`
    ).pipe(share());
  }

  /**
   * Réactiver un administrateur désactivé
   * @param adminId L'identifiant de l'administrateur
   * @returns Observable<RequestResultDto<string>>
   */
  reactivateAdmin(adminId: string): Observable<RequestResultDto<string>> {
    return this.http.patch<RequestResultDto<string>>(
      API_URLS.CUSTOMERS_URL + `/auth/admins/${adminId}/reactivate`,
      {}
    ).pipe(share());
  }
}

