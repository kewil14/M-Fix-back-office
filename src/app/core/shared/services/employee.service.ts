import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, share } from 'rxjs';
import { API_URLS } from '../../config/app.url.config';
import { RequestResultDto } from '../dtos/request-result-dto.modal';
import { CreateEmployeeDto } from '../dtos/create-employee-dto.modal';
import { EmployeeListRequestDto } from '../dtos/employee-list-request-dto';
import { EmployeeListResponseDto, EmployeeResponseDto } from '../dtos/employee-response-dto';
import { UpdateEmployeeDto } from '../dtos/update-employee-dto';

@Injectable({ providedIn: 'root' })
export class EmployeeService {

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Récupérer la liste paginée des employés avec filtres
   * @param filters Les filtres de recherche
   * @returns Observable<RequestResultDto<EmployeeListResponseDto>>
   */
  findAllEmployees(filters: EmployeeListRequestDto): Observable<RequestResultDto<EmployeeListResponseDto>> {
    let params = new HttpParams();
    
    if (filters.workspaceId) params = params.set('dto.workspaceId', filters.workspaceId);
    if (filters.shopId) params = params.set('dto.shopId', filters.shopId);
    if (filters.userType) params = params.set('dto.userType', filters.userType);
    if (filters.isActive !== undefined) params = params.set('dto.isActive', filters.isActive.toString());
    if (filters.search) params = params.set('dto.search', filters.search);
    if (filters.department) params = params.set('dto.department', filters.department);
    if (filters.page !== undefined) params = params.set('dto.page', filters.page.toString());
    if (filters.size !== undefined) params = params.set('dto.size', filters.size.toString());
    if (filters.sortBy) params = params.set('dto.sortBy', filters.sortBy);
    if (filters.sortDirection) params = params.set('dto.sortDirection', filters.sortDirection);

    return this.http.get<RequestResultDto<EmployeeListResponseDto>>(
      API_URLS.CUSTOMERS_URL + `/auth/users/employees`,
      { params }
    ).pipe(share());
  }

  /**
   * Récupérer un employé par son ID
   * @param employeeId L'identifiant de l'employé
   * @returns Observable<RequestResultDto<EmployeeResponseDto>>
   */
  findEmployeeById(employeeId: string): Observable<RequestResultDto<EmployeeResponseDto>> {
    return this.http.get<RequestResultDto<EmployeeResponseDto>>(
      API_URLS.CUSTOMERS_URL + `/auth/users/employee/${employeeId}`
    ).pipe(share());
  }

  /**
   * Créer un nouvel employé
   * @param createEmployeeDto Les données de l'employé
   * @returns Observable<RequestResultDto<EmployeeResponseDto>>
   */
  createEmployee(createEmployeeDto: CreateEmployeeDto): Observable<RequestResultDto<EmployeeResponseDto>> {
    return this.http.post<RequestResultDto<EmployeeResponseDto>>(
      API_URLS.CUSTOMERS_URL + `/auth/users/employee`,
      createEmployeeDto
    ).pipe(share());
  }

  /**
   * Mettre à jour un employé
   * @param employeeId L'identifiant de l'employé
   * @param updateEmployeeDto Les données à mettre à jour
   * @returns Observable<RequestResultDto<EmployeeResponseDto>>
   */
  updateEmployee(employeeId: string, updateEmployeeDto: UpdateEmployeeDto): Observable<RequestResultDto<EmployeeResponseDto>> {
    return this.http.put<RequestResultDto<EmployeeResponseDto>>(
      API_URLS.CUSTOMERS_URL + `/auth/users/employee/${employeeId}`,
      updateEmployeeDto
    ).pipe(share());
  }

  /**
   * Désactiver un employé (soft delete)
   * @param employeeId L'identifiant de l'employé
   * @returns Observable<RequestResultDto<string>>
   */
  deleteEmployee(employeeId: string): Observable<RequestResultDto<string>> {
    return this.http.delete<RequestResultDto<string>>(
      API_URLS.CUSTOMERS_URL + `/auth/users/employee/${employeeId}`
    ).pipe(share());
  }

  /**
   * Réactiver un employé désactivé
   * @param employeeId L'identifiant de l'employé
   * @returns Observable<RequestResultDto<string>>
   */
  reactivateEmployee(employeeId: string): Observable<RequestResultDto<string>> {
    return this.http.patch<RequestResultDto<string>>(
      API_URLS.CUSTOMERS_URL + `/auth/users/employee/${employeeId}/reactivate`,
      {}
    ).pipe(share());
  }
}

