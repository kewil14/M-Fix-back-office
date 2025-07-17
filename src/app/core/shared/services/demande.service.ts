import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, share } from 'rxjs';
import { API_URLS } from '../../config/app.url.config';
import { RequestResultDto } from '../dtos/request-result-dto.modal';
import { Demand } from '../models/demand.modal';
import { DemandeRequestDto } from '../dtos/demande-request-dto.modal';
import { RequestResultPaginateDto } from '../dtos/request-result-paginate-dto.modal';

@Injectable({ providedIn: 'root' })
export class DemandeService {

  constructor(
    private http: HttpClient
  ) { }
  
  /**
   * The Service get all the demands
   * @param 
   * @returns Observable<Demand>
   */
  getAllDemand(state: string, page: number, size: number, sort: string): Observable<RequestResultDto<RequestResultPaginateDto<Demand[]>>> {
    return this.http.get(API_URLS.CUSTOMERS_URL + `/demands/findAll?state=${state}&page=${page}&size=${size}&sort=${sort}`).pipe(share());
  }



  /**
   * The Service get all the demands of a user
   * @param 
   * @returns Observable<Demand>
   */
  getAllDemandOfUser(userCode: string, state: string,): Observable<RequestResultDto<Demand[]>> {
    return this.http.get(API_URLS.CUSTOMERS_URL + `/demands/findUserDemands?userCode=${userCode}&state=${state}`).pipe(share());
  }

  /**
   * The Service get all the demands of a user
   * @param 
   * @returns Observable<Demand>
   */
  getByIdDemande(idDemande: string,): Observable<RequestResultDto<Demand>> {
    return this.http.get(API_URLS.CUSTOMERS_URL + `/demands/findByIdDemande?${idDemande}`).pipe(share());
  }


  /**
   * The Service update the demands
   * @param 
   * @returns Observable<Demand>
   */
  updateStatusDemand(demand: DemandeRequestDto): Observable<RequestResultDto<Demand>> {
    return this.http.put(API_URLS.CUSTOMERS_URL + `/update`, demand).pipe(share());
  }

  /**
   * delete demands
   * @param
   * @returns Observable<RequestResultDto<string>>
   */
  deleteDemand(idDemande: string): Observable<RequestResultDto<string>> {
    return this.http.delete(API_URLS.CUSTOMERS_URL + `/demands/delete?idDemande=${idDemande}`).pipe(share());
  }
  
  /**
   * Le service create the demands
   * @param  
   * @returns
   */
  createDemand(demands: DemandeRequestDto): Observable<RequestResultDto<Demand>> {
    return this.http.post(API_URLS.CUSTOMERS_URL + `/demands/create`, demands).pipe(share());
  }

  
}






		
			
