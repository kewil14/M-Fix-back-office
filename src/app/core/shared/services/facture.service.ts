import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, share } from 'rxjs';
import { API_URLS } from '../../config/app.url.config';
import { RequestResultDto } from '../dtos/request-result-dto.modal';
import { RequestResultPaginateDto } from '../dtos/request-result-paginate-dto.modal';
import { Facture } from '../models/facture.modal';
import { FactureRequestDto } from '../dtos/facture-request-dto.modal ';

@Injectable({ providedIn: 'root' })
export class FactureService {

  constructor(
    private http: HttpClient
  ) { }
  
  /**
   * The Service get all the facture
   * @param 
   * @returns Observable<Facture>
   */
  getAllFacture(idFacture: string, idDevis: string, idDemande: string, state: string, idCustomer: string,  startDate: string,  endDate: string): Observable<RequestResultDto<RequestResultPaginateDto<Facture[]>>> {
    return this.http.get(API_URLS.CUSTOMERS_URL + `/factures/findAll?idFacture=${idFacture}&idDevis=${idDevis}&idDemande=${idDemande}&state=${state}&idCustomer=${idCustomer}`).pipe(share());
  }

  // /**
  //  * The Service get facture by id
  //  * @param 
  //  * @returns Observable<Facture>
  //  */
  // getFactureById(idFacture: string,): Observable<RequestResultDto<Facture>> {
  //   return this.http.get(API_URLS.CUSTOMERS_URL + `/facture/findByIdFacture/${idFacture}`).pipe(share());
  // }


  // /**
  //  * The Service update the facture
  //  * @param 
  //  * @returns Observable<Facture>
  //  */
  // updateFacture(facture: FactureRequestDto): Observable<RequestResultDto<Facture>> {
  //   return this.http.put(API_URLS.CUSTOMERS_URL + `/facture/update`, facture).pipe(share());
  // }

  // /**
  //  * delete facture
  //  * @param
  //  * @returns Observable<RequestResultDto<string>>
  //  */
  // deleteFacture(userCode: string): Observable<RequestResultDto<string>> {
  //   return this.http.delete(API_URLS.CUSTOMERS_URL + `/facture/delete/${userCode}`).pipe(share());
  // }
  
  /**
   * Le service create the facture
   * @param  
   * @returns
   */
  createFacture(facture: FactureRequestDto): Observable<RequestResultDto<Facture>> {
    return this.http.post(API_URLS.CUSTOMERS_URL + `/factures/create`, facture).pipe(share());
  }

  
}






		
			
