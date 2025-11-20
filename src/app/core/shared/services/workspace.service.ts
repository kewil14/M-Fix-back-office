import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, share } from 'rxjs';
import { API_URLS } from '../../config/app.url.config';
import { RequestResultDto } from '../dtos/request-result-dto.modal';
import { EmployeeResponseDto } from '../dtos/employee-response-dto';
import { 
  WorkspaceResponseDto, 
  WorkspaceListResponseDto, 
  WorkspaceListRequestDto,
  CreateWorkspaceDto,
  UpdateWorkspaceDto
} from '../dtos/workspace-response-dto';

export interface WorkspaceDto {
  id: string;
  name: string;
  adminName?: string;
}

@Injectable({ providedIn: 'root' })
export class WorkspaceService {

  constructor(
    private http: HttpClient
  ) { }

  findAllWorkspaces(): Observable<RequestResultDto<WorkspaceDto[]>> {
    const params = new HttpParams()
      .set('dto.page', '0')
      .set('dto.size', '1000')
      .set('dto.isActive', 'true');

    return this.http.get<RequestResultDto<any>>(
      API_URLS.CUSTOMERS_URL + `/auth/workspace-admins`,
      { params }
    ).pipe(
      map((data: RequestResultDto<any>) => {
        if (data.status === 'SUCCESS' && data.data?.content) {
          const workspacesMap = new Map<string, WorkspaceDto>();
          
          data.data.content.forEach((admin: EmployeeResponseDto) => {
            if (admin.workspaceId && !workspacesMap.has(admin.workspaceId)) {
              const workspaceType = admin.type || 'WORKSPACE_ADMIN';
              const adminName = `${admin.firstName || ''} ${admin.lastName || ''}`.trim() || admin.email || '';
              const displayName = workspaceType;
              
              workspacesMap.set(admin.workspaceId, {
                id: admin.workspaceId,
                name: displayName,
                adminName: adminName
              });
            }
          });

          const workspaces = Array.from(workspacesMap.values());
          return {
            ...data,
            data: workspaces
          } as RequestResultDto<WorkspaceDto[]>;
        }
        return {
          ...data,
          data: []
        } as RequestResultDto<WorkspaceDto[]>;
      }),
      share()
    );
  }

  // Nouvelles méthodes pour la gestion complète des workspaces
  getWorkspaces(filters: WorkspaceListRequestDto): Observable<RequestResultDto<WorkspaceListResponseDto>> {
    let params = new HttpParams();
    
    if (filters.search) params = params.set('dto.search', filters.search);
    if (filters.type) params = params.set('dto.type', filters.type);
    if (filters.subscriptionPlan) params = params.set('dto.subscriptionPlan', filters.subscriptionPlan);
    if (filters.isActive !== undefined) params = params.set('dto.isActive', filters.isActive.toString());
    if (filters.page !== undefined) params = params.set('dto.page', filters.page.toString());
    if (filters.size !== undefined) params = params.set('dto.size', filters.size.toString());
    if (filters.sortBy) params = params.set('dto.sortBy', filters.sortBy);
    if (filters.sortDirection) params = params.set('dto.sortDirection', filters.sortDirection);

    return this.http.get<RequestResultDto<WorkspaceListResponseDto>>(
      API_URLS.CUSTOMERS_URL + `/workspaces`,
      { params }
    ).pipe(share());
  }

  getWorkspaceById(workspaceId: string): Observable<RequestResultDto<WorkspaceResponseDto>> {
    return this.http.get<RequestResultDto<WorkspaceResponseDto>>(
      API_URLS.CUSTOMERS_URL + `/workspaces/${workspaceId}`
    ).pipe(share());
  }

  createWorkspace(createWorkspaceDto: CreateWorkspaceDto): Observable<RequestResultDto<WorkspaceResponseDto>> {
    return this.http.post<RequestResultDto<WorkspaceResponseDto>>(
      API_URLS.CUSTOMERS_URL + `/workspaces`,
      createWorkspaceDto
    ).pipe(share());
  }

  updateWorkspace(workspaceId: string, updateWorkspaceDto: UpdateWorkspaceDto): Observable<RequestResultDto<WorkspaceResponseDto>> {
    return this.http.put<RequestResultDto<WorkspaceResponseDto>>(
      API_URLS.CUSTOMERS_URL + `/workspaces/${workspaceId}`,
      updateWorkspaceDto
    ).pipe(share());
  }

  deleteWorkspace(workspaceId: string): Observable<RequestResultDto<string>> {
    return this.http.delete<RequestResultDto<string>>(
      API_URLS.CUSTOMERS_URL + `/workspaces/${workspaceId}`
    ).pipe(share());
  }

  reactivateWorkspace(workspaceId: string): Observable<RequestResultDto<string>> {
    return this.http.patch<RequestResultDto<string>>(
      API_URLS.CUSTOMERS_URL + `/workspaces/${workspaceId}/reactivate`,
      {}
    ).pipe(share());
  }
}

