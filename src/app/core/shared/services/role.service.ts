import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, from, groupBy, map, mergeMap, share, toArray } from 'rxjs';
import { AutorisationResponseDto } from '../dtos/autorisation-response-dto';
import { RequestResultDto } from '../dtos/request-result-dto.modal';
import { API_URLS } from '../../config/app.url.config';
import { RoleResponseDto } from '../dtos/role-response-dto';
import { GroupItemsFinDto } from '../dtos/group-items-fin-dto.modal';
import { GroupRoleItem } from '../models/users/group-role-item.modal';
import { ResponseDto } from '../dtos/response-dto.modal';
import { RoleRequestDto } from '../dtos/role-request-dto';
import { CreateRoleRequestDto } from '../dtos/create-role-request-dto';
import { AssignRoleRequestDto } from '../dtos/assign-role-request-dto';
import { UpdateRolePermissionsDto } from '../dtos/update-role-permissions-dto';
import { AvailablePermissionsResponseDto, PermissionDto } from '../dtos/permission-dto';
import { RoleDetailResponseDto } from '../dtos/role-detail-response-dto';
import { AvailableRolesResponseDto } from '../dtos/available-roles-response-dto';

@Injectable({ providedIn: 'root' })
export class RoleService {

  constructor(
    private http: HttpClient
  ) { }
  
  findAllRoleItem(): Observable<RequestResultDto<Array<AutorisationResponseDto>>> {
    return this.http.get<RequestResultDto<AvailablePermissionsResponseDto>>(
      API_URLS.CUSTOMERS_URL + `/auth/roles/permissions/available`
    ).pipe(
      map((data: RequestResultDto<AvailablePermissionsResponseDto>) => {
        if (data.status === 'SUCCESS' && data.data?.permissions) {
          const autorisations = data.data.permissions.map((perm: PermissionDto) => {
            const autorisation = new AutorisationResponseDto();
            autorisation.authorisationKey = perm.id;
            autorisation.authorisationName = perm.name;
            autorisation.authorisationDescription = perm.description;
            autorisation.authorisationGroup = new GroupRoleItem();
            autorisation.authorisationGroup.groupName = perm.resource || perm.scope || 'default';
            return autorisation;
          });
          return {
            ...data,
            data: autorisations
          } as RequestResultDto<Array<AutorisationResponseDto>>;
        }
        return {
          ...data,
          data: []
        } as RequestResultDto<Array<AutorisationResponseDto>>;
      }),
      share()
    );
  }
  findAllRoleSaasAdmin(): Observable<RequestResultDto<Array<AutorisationResponseDto>>> {
    return this.http.get(API_URLS.CUSTOMERS_URL + `/roleSaasSpace/search?search=`).pipe(share());
  }
  
  findAllRoleItemSaas(): Observable<RequestResultDto<AutorisationResponseDto[]>> {
    return this.http.get(API_URLS.CUSTOMERS_URL + `/authorisations/allAuthorisationsForSaas`).pipe(share());
  }

  findAvailableRoles(workspaceId?: string, shopId?: string): Observable<RequestResultDto<AvailableRolesResponseDto>> {
    let url = API_URLS.CUSTOMERS_URL + `/auth/roles/available`;
    const params: string[] = [];
    if (workspaceId) {
      params.push(`workspaceId=${workspaceId}`);
    }
    if (shopId) {
      params.push(`shopId=${shopId}`);
    }
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    return this.http.get<RequestResultDto<AvailableRolesResponseDto>>(url).pipe(share());
  }

  findRoleById(idRole: any): Observable<ResponseDto<RoleResponseDto>> {
    return this.http.get(API_URLS.CUSTOMERS_URL + `/role/${idRole}`).pipe(share());
  }

  createRoleNew(role: CreateRoleRequestDto): Observable<RequestResultDto<RoleDetailResponseDto>> {
    return this.http.post<RequestResultDto<RoleDetailResponseDto>>(
      API_URLS.CUSTOMERS_URL + `/auth/roles`, 
      role
    ).pipe(share());
  }

  createRole(role: RoleRequestDto): Observable<RequestResultDto<RoleResponseDto>> {
    return this.http.post(API_URLS.CUSTOMERS_URL + `/roles/create`, role).pipe(share());
  }

  updateRole(role: RoleRequestDto): Observable<RequestResultDto<RoleResponseDto>> {
    return this.http.put(API_URLS.CUSTOMERS_URL + `/roles/update`, role).pipe(share());
  }

  updateRolePermissions(roleId: string, permissions: UpdateRolePermissionsDto): Observable<RequestResultDto<RoleDetailResponseDto>> {
    return this.http.patch<RequestResultDto<RoleDetailResponseDto>>(
      API_URLS.CUSTOMERS_URL + `/auth/roles/${roleId}/permissions`, 
      permissions
    ).pipe(share());
  }
  
  deleteRole(idRole: string): Observable<RequestResultDto<any>> {
    return this.http.delete<RequestResultDto<any>>(
      API_URLS.CUSTOMERS_URL + `/auth/roles/${idRole}`
    ).pipe(share());
  }

  getAvailablePermissions(): Observable<RequestResultDto<AvailablePermissionsResponseDto>> {
    return this.http.get<RequestResultDto<AvailablePermissionsResponseDto>>(
      API_URLS.CUSTOMERS_URL + `/auth/roles/permissions/available`
    ).pipe(share());
  }

  assignRole(assignRequest: AssignRoleRequestDto): Observable<RequestResultDto<any>> {
    return this.http.post<RequestResultDto<any>>(
      API_URLS.CUSTOMERS_URL + `/auth/roles/assign`, 
      assignRequest
    ).pipe(share());
  }

  revokeRole(targetUserId: string, roleId: string, workspaceId?: string): Observable<RequestResultDto<any>> {
    let url = API_URLS.CUSTOMERS_URL + `/auth/roles/revoke?targetUserId=${targetUserId}&roleId=${roleId}`;
    if (workspaceId) {
      url += `&workspaceId=${workspaceId}`;
    }
    return this.http.delete<RequestResultDto<any>>(url).pipe(share());
  }
  
  getListFin(items: AutorisationResponseDto[]): Observable<GroupItemsFinDto[]> {
    return from(items).pipe(
      groupBy(item => item.authorisationGroup?.groupName),
      mergeMap(items$ =>{
        return items$.pipe(
          toArray(),
          map(items =>{return new GroupItemsFinDto(items$.key, items)})
        )}),
      toArray()
    )
  }

}
