import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, Optional } from '@angular/core';
import { Observable, map, share, switchMap, of } from 'rxjs';
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
import { PermissionService } from './permission.service';

export interface WorkspaceDto {
  id: string;
  name: string;
  adminName?: string;
}

@Injectable({ providedIn: 'root' })
export class WorkspaceService {

  constructor(
    private http: HttpClient,
    @Optional() private permissionService?: PermissionService
  ) { }

  findAllWorkspaces(workspaceId?: string): Observable<RequestResultDto<WorkspaceDto[]>> {
    let params = new HttpParams()
      .set('dto.page', '0')
      .set('dto.size', '1000')
      .set('dto.isActive', 'true');
    
    // Si workspaceId est fourni, filtrer par ce workspace
    // Sinon, si l'utilisateur est un Workspace Admin, utiliser son workspace_id
    const finalWorkspaceId = workspaceId || (this.permissionService?.isWorkspaceAdmin() ? this.permissionService.getWorkspaceId() : undefined);
    if (finalWorkspaceId) {
      params = params.set('dto.workspaceId', finalWorkspaceId);
      console.log('[WorkspaceService.findAllWorkspaces] Filtering by workspace_id:', finalWorkspaceId);
    } else {
      console.log('[WorkspaceService.findAllWorkspaces] No workspace filter - loading all workspaces');
    }

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
    
    if (filters.isActive !== undefined) params = params.set('isActive', filters.isActive.toString());
    if (filters.page !== undefined) params = params.set('page', filters.page.toString());
    if (filters.size !== undefined) params = params.set('size', filters.size.toString());

    return this.http.get<RequestResultDto<any>>(
      API_URLS.WORKSPACE_SERVICE_URL + `/api/workspaces`,
      { params }
    ).pipe(
      map((data: RequestResultDto<any>) => {
        // Adapter la réponse pour correspondre à WorkspaceListResponseDto
        if (data.status === 'SUCCESS' && data.data) {
          return {
            ...data,
            data: {
              content: data.data.content || [],
              totalElements: data.data.totalElements || 0,
              totalPages: data.data.totalPages || 0,
              size: data.data.size || 20,
              number: data.data.page || 0,
              sort: { empty: false, sorted: false, unsorted: true },
              pageable: {
                offset: (data.data.page || 0) * (data.data.size || 20),
                sort: { empty: false, sorted: false, unsorted: true },
                pageNumber: data.data.page || 0,
                pageSize: data.data.size || 20,
                unpaged: false
              },
              numberOfElements: data.data.content?.length || 0,
              first: (data.data.page || 0) === 0,
              last: (data.data.page || 0) >= (data.data.totalPages || 0) - 1,
              empty: !data.data.content || data.data.content.length === 0
            }
          } as RequestResultDto<WorkspaceListResponseDto>;
        }
        return data as RequestResultDto<WorkspaceListResponseDto>;
      }),
      share()
    );
  }

  getWorkspaceById(workspaceId: string): Observable<RequestResultDto<WorkspaceResponseDto>> {
    return this.http.get<RequestResultDto<WorkspaceResponseDto>>(
      API_URLS.WORKSPACE_SERVICE_URL + `/api/workspaces/${workspaceId}`
    ).pipe(share());
  }

  createWorkspace(createWorkspaceDto: CreateWorkspaceDto): Observable<RequestResultDto<WorkspaceResponseDto>> {
    // L'endpoint /api/workspaces/init nécessite ownerId, industry, planType, etc.
    const initDto = {
      name: createWorkspaceDto.name,
      ownerId: (createWorkspaceDto as any).adminId || '',
      industry: createWorkspaceDto.type || 'REPAIR_SHOP',
      planType: createWorkspaceDto.subscriptionPlan || 'FREE',
      createdBy: (createWorkspaceDto as any).adminId || '',
      description: (createWorkspaceDto as any).description || ''
    };
    
    return this.http.post<RequestResultDto<any>>(
      API_URLS.WORKSPACE_SERVICE_URL + `/api/workspaces/init`,
      initDto
    ).pipe(
      switchMap((data: RequestResultDto<any>) => {
        // Après création, récupérer le workspace complet
        if (data.status === 'SUCCESS' && data.data?.workspaceId) {
          return this.getWorkspaceById(data.data.workspaceId);
        }
        return of(data as RequestResultDto<WorkspaceResponseDto>);
      }),
      share()
    );
  }

  updateWorkspace(workspaceId: string, updateWorkspaceDto: UpdateWorkspaceDto): Observable<RequestResultDto<WorkspaceResponseDto>> {
    const updateDto: any = {};
    if (updateWorkspaceDto.description !== undefined) updateDto.description = updateWorkspaceDto.description;
    if (updateWorkspaceDto.logo !== undefined) updateDto.logo = updateWorkspaceDto.logo;
    if ((updateWorkspaceDto as any).domain !== undefined) updateDto.domain = (updateWorkspaceDto as any).domain;
    
    return this.http.put<RequestResultDto<WorkspaceResponseDto>>(
      API_URLS.WORKSPACE_SERVICE_URL + `/api/workspaces/${workspaceId}`,
      updateDto
    ).pipe(share());
  }

  deleteWorkspace(workspaceId: string): Observable<RequestResultDto<string>> {
    return this.http.put<RequestResultDto<string>>(
      API_URLS.WORKSPACE_SERVICE_URL + `/api/workspaces/${workspaceId}/deactivate`,
      {}
    ).pipe(share());
  }

  reactivateWorkspace(workspaceId: string): Observable<RequestResultDto<string>> {
    return this.http.put<RequestResultDto<string>>(
      API_URLS.WORKSPACE_SERVICE_URL + `/api/workspaces/${workspaceId}/activate`,
      {}
    ).pipe(share());
  }

  /**
   * Export workspaces to CSV
   * @param isActive Filter by active status (optional)
   * @param industry Filter by industry (optional)
   */
  exportWorkspaces(isActive?: boolean, industry?: string): Observable<Blob> {
    let params = new HttpParams();
    if (isActive !== undefined) params = params.set('isActive', isActive.toString());
    if (industry) params = params.set('industry', industry);
    
    return this.http.get(
      API_URLS.WORKSPACE_SERVICE_URL + `/api/workspaces/export`,
      { 
        params,
        responseType: 'blob',
        observe: 'body'
      }
    );
  }
}

