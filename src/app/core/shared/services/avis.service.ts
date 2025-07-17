import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { Observable, share } from 'rxjs';
import { API_URLS } from '../../config/app.url.config';
import { RequestResultDto } from '../dtos/request-result-dto.modal';
import { Avis } from '../models/avis.modal';
import { AvisRequestDto } from '../dtos/avis-request-dto.modal';

@Injectable({ providedIn: 'root' })
export class AvisService {

  constructor(
    private http: HttpClient
  ) { }
  
  /**
   * The Service get all the avis
   * @param 
   * @returns Observable<Avis>
   */
  getAllAvis(): Observable<RequestResultDto<Avis[]>> {
    return this.http.get(API_URLS.CUSTOMERS_URL + `/avis`).pipe(share());
  }


  /**
   * The Service get all the avis by state
   * @param 
   * @returns Observable<Avis[]>
   */
  getAllAvisByState(state: string): Observable<RequestResultDto<Avis[]>> {
    return this.http.get(API_URLS.CUSTOMERS_URL + `/avis/state/${state}`).pipe(share());
  }

  /**
   * The Service get avis by id
   * @param 
   * @returns Observable<Avis>
   */
  getAvisById(idAvis: string,): Observable<RequestResultDto<Avis>> {
    return this.http.get(API_URLS.CUSTOMERS_URL + `/avis/${idAvis}`).pipe(share());
  }


  /**
   * The Service update the avis
   * @param 
   * @returns Observable<Avis>
   */
  updateStatusAvis(avis: AvisRequestDto, status: boolean): Observable<RequestResultDto<Avis>> {
    return this.http.put(API_URLS.CUSTOMERS_URL + `/avis/${avis.idAvis}/validate?isValid=${status}`, "").pipe(share());
  }

  /**
   * delete avis
   * @param
   * @returns Observable<RequestResultDto<string>>
   */
  deleteAvis(userCode: string): Observable<RequestResultDto<string>> {
    return this.http.delete(API_URLS.CUSTOMERS_URL + `/avis/delete/${userCode}`).pipe(share());
  }
  
  /**
   * Le service create the avis
   * @param  
   * @returns
   */
  createAvis(avis: AvisRequestDto): Observable<RequestResultDto<Avis>> {
    return this.http.post(API_URLS.CUSTOMERS_URL + `/avis`, avis).pipe(share());
  }

  
}






		
			
