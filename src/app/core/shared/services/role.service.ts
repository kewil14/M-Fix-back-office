import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, from, groupBy, map, mergeMap, share, toArray } from 'rxjs';
import { AutorisationResponseDto } from '../dtos/autorisation-response-dto';
import { RequestResultDto } from '../dtos/request-result-dto.modal';
import { API_URLS } from '../../config/app.url.config';
import { RoleResponseDto } from '../dtos/role-response-dto';
import { GroupItemsFinDto } from '../dtos/group-items-fin-dto.modal';
import { ResponseDto } from '../dtos/response-dto.modal';
import { RoleRequestDto } from '../dtos/role-request-dto';

@Injectable({ providedIn: 'root' })
export class RoleService {

  constructor(
    private http: HttpClient
  ) { }
  
  findAllRoleItem(): Observable<RequestResultDto<Array<AutorisationResponseDto>>> {
    return this.http.get(API_URLS.CUSTOMERS_URL + `/authorisations/all`).pipe(share());
  }
  findAllRoleSaasAdmin(): Observable<RequestResultDto<Array<AutorisationResponseDto>>> {
    return this.http.get(API_URLS.CUSTOMERS_URL + `/roleSaasSpace/search?search=`).pipe(share());
  }
  createRole(role: RoleRequestDto):Observable<RequestResultDto<RoleResponseDto>> {
    return this.http.post(API_URLS.CUSTOMERS_URL + `/roles/create`, role).pipe(share());
  }
  
  /**
   * find all roleItem of saas-insatance
   * @returns Observable<RequestResultDto<AutorisationResponseDto[]>>
   * 
   */
  findAllRoleItemSaas(): Observable<RequestResultDto<AutorisationResponseDto[]>> {
    return this.http.get(API_URLS.CUSTOMERS_URL + `/authorisations/allAuthorisationsForSaas`).pipe(share());
  }

  findAllRoles():  Observable<RequestResultDto<Array<RoleResponseDto>>> {
    return this.http.get(API_URLS.CUSTOMERS_URL + `/roles/findAll`).pipe(share());
  }
  
  /**
   * Rechercher un role par son identifiant
   * @param idRole 
   * @returns Observable<ResponseDto<Role>>
   */
  findRoleById(idRole: any): Observable<ResponseDto<RoleResponseDto>> {
    return this.http.get(API_URLS.CUSTOMERS_URL + `/role/${idRole}`).pipe(share());
  }
  
  /**
   * Creation d'un role administrateur dans le systeme
   * @param role 
   * @returns Observable<ResponseDto<Role>>
   */
  // createRoleAdmin(role: Role): Observable<ResponseDto<Role>> {
  //   return this.http.post(API_URLS.CUSTOMERS_URL + `/role/admin`, role).pipe(share());
  // }

  /**
   * Mettre a jour les informations d'un role dans le systeme
   * @param role 
   * @returns Observable<ResponseDto<Role>> 
   */
  updateRole(role: RoleRequestDto): Observable<RequestResultDto<RoleResponseDto>> {
    return this.http.put(API_URLS.CUSTOMERS_URL + `/roles/update`, role).pipe(share());
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
