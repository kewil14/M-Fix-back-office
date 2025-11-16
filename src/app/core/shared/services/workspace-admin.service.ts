import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, share } from 'rxjs';
import { API_URLS } from '../../config/app.url.config';
import { RequestResultDto } from '../dtos/request-result-dto.modal';
import { EmployeeListResponseDto, EmployeeResponseDto } from '../dtos/employee-response-dto';
import { WorkspaceAdminListRequestDto } from '../dtos/workspace-admin-list-request-dto';
import { UpdateWorkspaceAdminDto } from '../dtos/update-workspace-admin-dto';

@Injectable({ providedIn: 'root' })
export class WorkspaceAdminService {

  constructor(
    private http: HttpClient
  ) { }

  findAllWorkspaceAdmins(filters: WorkspaceAdminListRequestDto): Observable<RequestResultDto<EmployeeListResponseDto>> {
    let params = new HttpParams();
    
    if (filters.workspaceId) params = params.set('dto.workspaceId', filters.workspaceId);
    if (filters.isActive !== undefined) params = params.set('dto.isActive', filters.isActive.toString());
    if (filters.search) params = params.set('dto.search', filters.search);
    if (filters.page !== undefined) params = params.set('dto.page', filters.page.toString());
    if (filters.size !== undefined) params = params.set('dto.size', filters.size.toString());
    if (filters.sortBy) params = params.set('dto.sortBy', filters.sortBy);
    if (filters.sortDirection) params = params.set('dto.sortDirection', filters.sortDirection);

    return this.http.get<RequestResultDto<EmployeeListResponseDto>>(
      API_URLS.CUSTOMERS_URL + `/auth/workspace-admins`,
      { params }
    ).pipe(share());
  }

  findWorkspaceAdminById(workspaceAdminId: string): Observable<RequestResultDto<EmployeeResponseDto>> {
    return this.http.get<RequestResultDto<EmployeeResponseDto>>(
      API_URLS.CUSTOMERS_URL + `/auth/workspace-admins/${workspaceAdminId}`
    ).pipe(share());
  }

  updateWorkspaceAdmin(workspaceAdminId: string, updateWorkspaceAdminDto: UpdateWorkspaceAdminDto): Observable<RequestResultDto<EmployeeResponseDto>> {
    return this.http.put<RequestResultDto<EmployeeResponseDto>>(
      API_URLS.CUSTOMERS_URL + `/auth/workspace-admins/${workspaceAdminId}`,
      updateWorkspaceAdminDto
    ).pipe(share());
  }

  deleteWorkspaceAdmin(workspaceAdminId: string): Observable<RequestResultDto<string>> {
    return this.http.delete<RequestResultDto<string>>(
      API_URLS.CUSTOMERS_URL + `/auth/workspace-admins/${workspaceAdminId}`
    ).pipe(share());
  }

  reactivateWorkspaceAdmin(workspaceAdminId: string): Observable<RequestResultDto<string>> {
    return this.http.patch<RequestResultDto<string>>(
      API_URLS.CUSTOMERS_URL + `/auth/workspace-admins/${workspaceAdminId}/reactivate`,
      {}
    ).pipe(share());
  }
}

