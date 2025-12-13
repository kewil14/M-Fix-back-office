import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, Optional } from '@angular/core';
import { Observable, share } from 'rxjs';
import { API_URLS } from '../../config/app.url.config';
import { RequestResultDto } from '../dtos/request-result-dto.modal';
import { CreateEmployeeDto } from '../dtos/create-employee-dto.modal';
import { EmployeeListRequestDto } from '../dtos/employee-list-request-dto';
import { EmployeeListResponseDto, EmployeeResponseDto } from '../dtos/employee-response-dto';
import { UpdateEmployeeDto } from '../dtos/update-employee-dto';
import { PermissionService } from './permission.service';

@Injectable({ providedIn: 'root' })
export class EmployeeService {

  constructor(
    private http: HttpClient,
    @Optional() private permissionService?: PermissionService
  ) { }

  findAllEmployees(filters: EmployeeListRequestDto): Observable<RequestResultDto<EmployeeListResponseDto>> {
    let params = new HttpParams();
    
    // Ne passer workspaceId que pour super admin et admin
    // Pour tous les autres rôles, le backend utilisera le workspace_id du token
    const isSuperAdmin = this.permissionService?.isSuperAdmin();
    const isAdmin = this.permissionService?.isAdmin();
    const finalWorkspaceId = (isSuperAdmin || isAdmin) ? filters.workspaceId : undefined;
    
    if (finalWorkspaceId) {
      params = params.set('workspaceId', finalWorkspaceId);
      console.log('[EmployeeService.findAllEmployees] Adding workspaceId filter (super admin/admin only):', finalWorkspaceId);
    } else if (!isSuperAdmin && !isAdmin && filters.workspaceId) {
      console.log('[EmployeeService.findAllEmployees] Not passing workspaceId - backend will use token workspace_id');
    }
    if (filters.shopId) params = params.set('shopId', filters.shopId);
    if (filters.userType) params = params.set('userType', filters.userType);
    if (filters.isActive !== undefined) params = params.set('isActive', filters.isActive.toString());
    if (filters.search) params = params.set('search', filters.search);
    if (filters.department) params = params.set('department', filters.department);
    if (filters.page !== undefined) params = params.set('page', filters.page.toString());
    if (filters.size !== undefined) params = params.set('size', filters.size.toString());
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortDirection) params = params.set('sortDirection', filters.sortDirection);

    return this.http.get<RequestResultDto<EmployeeListResponseDto>>(
      API_URLS.CUSTOMERS_URL + `/auth/users/employees`,
      { params }
    ).pipe(share());
  }

  findEmployeeById(employeeId: string): Observable<RequestResultDto<EmployeeResponseDto>> {
    return this.http.get<RequestResultDto<EmployeeResponseDto>>(
      API_URLS.CUSTOMERS_URL + `/auth/users/employee/${employeeId}`
    ).pipe(share());
  }

  createEmployee(createEmployeeDto: CreateEmployeeDto): Observable<RequestResultDto<EmployeeResponseDto>> {
    return this.http.post<RequestResultDto<EmployeeResponseDto>>(
      API_URLS.CUSTOMERS_URL + `/auth/users/employee`,
      createEmployeeDto
    ).pipe(share());
  }

  updateEmployee(employeeId: string, updateEmployeeDto: UpdateEmployeeDto): Observable<RequestResultDto<EmployeeResponseDto>> {
    return this.http.put<RequestResultDto<EmployeeResponseDto>>(
      API_URLS.CUSTOMERS_URL + `/auth/users/employee/${employeeId}`,
      updateEmployeeDto
    ).pipe(share());
  }

  deleteEmployee(employeeId: string): Observable<RequestResultDto<string>> {
    return this.http.delete<RequestResultDto<string>>(
      API_URLS.CUSTOMERS_URL + `/auth/users/employee/${employeeId}`
    ).pipe(share());
  }

  reactivateEmployee(employeeId: string): Observable<RequestResultDto<string>> {
    return this.http.patch<RequestResultDto<string>>(
      API_URLS.CUSTOMERS_URL + `/auth/users/employee/${employeeId}/reactivate`,
      {}
    ).pipe(share());
  }
}

