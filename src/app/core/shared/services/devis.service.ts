import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, share } from 'rxjs';
import { API_URLS } from '../../config/app.url.config';
import { RequestResultDto } from '../dtos/request-result-dto.modal';
import { RequestResultPaginateDto } from '../dtos/request-result-paginate-dto.modal';
import { Devis } from '../models/devis.modal';
import { DevisRequestDto } from '../dtos/devis-request-dto.modal';

@Injectable({ providedIn: 'root' })
export class DevisService {

  constructor(
    private http: HttpClient
  ) { }
  
  /**
   * The Service get all the devis
   * @param 
   * @returns Observable<Devis>
   */
  getAllDevis(userCode?: string, state?: string, startDate?: string, endDate?: string, page?: number, size?: number, sort?: string): Observable<RequestResultDto<RequestResultPaginateDto<Devis[]>>> {
  const params: any = {};
  
  if (userCode !== undefined) params.userCode = userCode;
  if (state !== undefined) params.state = state;
  if (startDate !== undefined) params.startDate = startDate;
  if (endDate !== undefined) params.endDate = endDate;
  if (page !== undefined) params.page = page;
  if (size !== undefined) params.size = size;
  if (sort !== undefined) params.sort = sort;


  if (startDate !== undefined) {
    // Convertir en format ISO sans le 'Z' (UTC) à la fin
    const formattedStartDate =  new Date(startDate).toISOString().replace('Z', '')
    params.startDate = formattedStartDate;
  }
  
  if (endDate !== undefined) {
    const formattedEndDate = new Date(endDate).toISOString().replace('Z', '')
    params.endDate = formattedEndDate;
  }
  
  const httpParams = new HttpParams({ fromObject: params });
  
  return this.http.get(API_URLS.CUSTOMERS_URL + '/devis/findAll', { params: httpParams }).pipe(share());
  }

  /**
   * The Service get devis by id
   * @param 
   * @returns Observable<Devis>
   */
  getDevisById(idDevis: string,): Observable<RequestResultDto<Devis>> {
    return this.http.get(API_URLS.CUSTOMERS_URL + `/devis/findByIdDevis/${idDevis}`).pipe(share());
  }


  /**
   * The Service update the devis
   * @param 
   * @returns Observable<Devis>
   */
  updateDevis(devis: DevisRequestDto): Observable<RequestResultDto<Devis>> {
    return this.http.put(API_URLS.CUSTOMERS_URL + `/devis/update`, devis).pipe(share());
  }

  /**
   * delete devis
   * @param
   * @returns Observable<RequestResultDto<string>>
   */
  deleteDevis(userCode: string): Observable<RequestResultDto<string>> {
    return this.http.delete(API_URLS.CUSTOMERS_URL + `/devis/delete/${userCode}`).pipe(share());
  }
  
  /**
   * Le service create the devis
   * @param  
   * @returns
   */
  createDevis(devis: DevisRequestDto): Observable<RequestResultDto<Devis>> {
    return this.http.post(API_URLS.CUSTOMERS_URL + `/devis/create`, devis).pipe(share());
  }

  
}






		
			
