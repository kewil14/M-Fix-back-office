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
  
  /**
   * Récupérer toutes les autorisations (utilise le nouvel endpoint pour les permissions disponibles)
   * @returns Observable<RequestResultDto<Array<AutorisationResponseDto>>>
   */
  findAllRoleItem(): Observable<RequestResultDto<Array<AutorisationResponseDto>>> {
    // Utiliser le nouvel endpoint pour les permissions disponibles
    return this.http.get<RequestResultDto<AvailablePermissionsResponseDto>>(
      API_URLS.CUSTOMERS_URL + `/auth/roles/permissions/available`
    ).pipe(
      map((data: RequestResultDto<AvailablePermissionsResponseDto>) => {
        // Convertir les permissions en format AutorisationResponseDto pour compatibilité
        if (data.status === 'SUCCESS' && data.data?.permissions) {
          const autorisations = data.data.permissions.map((perm: PermissionDto) => {
            const autorisation = new AutorisationResponseDto();
            autorisation.authorisationKey = perm.id;
            autorisation.authorisationName = perm.name;
            autorisation.authorisationDescription = perm.description;
            // Créer un GroupRoleItem pour authorisationGroup
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
  
  /**
   * find all roleItem of saas-insatance
   * @returns Observable<RequestResultDto<AutorisationResponseDto[]>>
   * 
   */
  findAllRoleItemSaas(): Observable<RequestResultDto<AutorisationResponseDto[]>> {
    return this.http.get(API_URLS.CUSTOMERS_URL + `/authorisations/allAuthorisationsForSaas`).pipe(share());
  }

  /**
   * Récupérer tous les rôles disponibles (nouveau endpoint selon swagger)
   * @param workspaceId Filtre par workspace ID (optionnel)
   * @param shopId Filtre par shop ID (optionnel)
   * @returns Observable<RequestResultDto<AvailableRolesResponseDto>>
   */
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

  
  /**
   * Rechercher un role par son identifiant (ancien endpoint)
   * @param idRole 
   * @returns Observable<ResponseDto<Role>>
   */
  findRoleById(idRole: any): Observable<ResponseDto<RoleResponseDto>> {
    return this.http.get(API_URLS.CUSTOMERS_URL + `/role/${idRole}`).pipe(share());
  }

  /**
   * Créer un nouveau rôle (nouveau endpoint selon swagger)
   * @param role DTO pour créer un rôle
   * @returns Observable<RequestResultDto<RoleDetailResponseDto>>
   */
  createRoleNew(role: CreateRoleRequestDto): Observable<RequestResultDto<RoleDetailResponseDto>> {
    return this.http.post<RequestResultDto<RoleDetailResponseDto>>(
      API_URLS.CUSTOMERS_URL + `/auth/roles`, 
      role
    ).pipe(share());
  }

  /**
   * Créer un rôle (ancien endpoint, à garder pour compatibilité)
   * @param role 
   * @returns Observable<RequestResultDto<RoleResponseDto>>
   */
  createRole(role: RoleRequestDto): Observable<RequestResultDto<RoleResponseDto>> {
    return this.http.post(API_URLS.CUSTOMERS_URL + `/roles/create`, role).pipe(share());
  }

  /**
   * Mettre a jour les informations d'un role dans le systeme (ancien endpoint)
   * @param role 
   * @returns Observable<RequestResultDto<RoleResponseDto>> 
   */
  updateRole(role: RoleRequestDto): Observable<RequestResultDto<RoleResponseDto>> {
    return this.http.put(API_URLS.CUSTOMERS_URL + `/roles/update`, role).pipe(share());
  }

  /**
   * Mettre à jour les permissions d'un rôle (nouveau endpoint selon swagger)
   * @param roleId L'identifiant du rôle
   * @param permissions DTO pour mettre à jour les permissions
   * @returns Observable<RequestResultDto<RoleDetailResponseDto>>
   */
  updateRolePermissions(roleId: string, permissions: UpdateRolePermissionsDto): Observable<RequestResultDto<RoleDetailResponseDto>> {
    return this.http.patch<RequestResultDto<RoleDetailResponseDto>>(
      API_URLS.CUSTOMERS_URL + `/auth/roles/${roleId}/permissions`, 
      permissions
    ).pipe(share());
  }
  
  /**
   * Supprimer un role
   * Note: Si le backend utilise /revoke pour supprimer, cette méthode devra être adaptée
   * @param idRole L'identifiant du role à supprimer
   * @returns Observable<RequestResultDto<any>>
   */
  deleteRole(idRole: string): Observable<RequestResultDto<any>> {
    // Endpoint standard pour supprimer un rôle
    // Si le backend nécessite /revoke, il faudra adapter avec les paramètres requis
    return this.http.delete<RequestResultDto<any>>(
      API_URLS.CUSTOMERS_URL + `/auth/roles/${idRole}`
    ).pipe(share());
  }

  /**
   * Obtenir les permissions disponibles pour créer des rôles (nouveau endpoint selon swagger)
   * @returns Observable<RequestResultDto<AvailablePermissionsResponseDto>>
   */
  getAvailablePermissions(): Observable<RequestResultDto<AvailablePermissionsResponseDto>> {
    return this.http.get<RequestResultDto<AvailablePermissionsResponseDto>>(
      API_URLS.CUSTOMERS_URL + `/auth/roles/permissions/available`
    ).pipe(share());
  }

  /**
   * Assigner un rôle à un utilisateur (nouveau endpoint selon swagger)
   * @param assignRequest DTO pour assigner un rôle
   * @returns Observable<RequestResultDto<any>>
   */
  assignRole(assignRequest: AssignRoleRequestDto): Observable<RequestResultDto<any>> {
    return this.http.post<RequestResultDto<any>>(
      API_URLS.CUSTOMERS_URL + `/auth/roles/assign`, 
      assignRequest
    ).pipe(share());
  }

  /**
   * Révoquer un rôle d'un utilisateur (nouveau endpoint selon swagger)
   * @param targetUserId L'identifiant de l'utilisateur
   * @param roleId L'identifiant du rôle
   * @param workspaceId L'identifiant du workspace (optionnel)
   * @returns Observable<RequestResultDto<any>>
   */
  revokeRole(targetUserId: string, roleId: string, workspaceId?: string): Observable<RequestResultDto<any>> {
    let url = API_URLS.CUSTOMERS_URL + `/auth/roles/revoke?targetUserId=${targetUserId}&roleId=${roleId}`;
    if (workspaceId) {
      url += `&workspaceId=${workspaceId}`;
    }
    return this.http.delete<RequestResultDto<any>>(url).pipe(share());
  }
  
  /**
   * renvoie tous les role regrouper
   * @returns Observable<ResponseDto<Array<GroupRoleItemDto>>> 
   */
  // getRoleItemByGroup(): Observable<ResponseDto<Array<GroupRoleItemDto>>> {
  //   return this.http.get(API_URLS.CUSTOMERS_URL + `/role/item/group`).pipe(share());
  // }
  
  /**
   * get list group by authorities
   * @param items 
   * @returns 
   */
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
