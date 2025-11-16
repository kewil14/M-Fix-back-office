import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, share } from 'rxjs';
import { API_URLS } from '../../config/app.url.config';
import { RequestResultDto } from '../dtos/request-result-dto.modal';
import { EmployeeResponseDto } from '../dtos/employee-response-dto';

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
}

