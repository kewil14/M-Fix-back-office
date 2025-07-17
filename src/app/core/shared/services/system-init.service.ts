import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URLS } from '../../config/app.url.config';
import { Observable, share } from 'rxjs';
import { RequestResultDto } from '../dtos/request-result-dto.modal';

@Injectable({
  providedIn: 'root'
})
export class SystemInitService {

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Method that check if the system have been initialised
   * @param
   * @return RequestResultDto<boolean>
   */
  checkInit(): Observable<RequestResultDto<boolean>> {
  return this.http.get(API_URLS.CUSTOMERS_URL + `/initialisation/check-system-state`).pipe(share())
  }

  /**
   *  Method that check if the system have been configured
   * @param
   * @return RequestResultDto<boolean>
   */
  checkConf(): Observable<RequestResultDto<boolean>> {
    return this.http.get(API_URLS.CUSTOMERS_URL + `/initialisation/checkConfiguration`).pipe(share())
  }

  /**
   *  Method that configured the system
   * @param
   * @return null
   */
  // configuration(defaultCurrency: DefaultCurrencyDto): Observable<RequestResultDto<any>>{
  //   return this.http.post(API_URLS.CUSTOMERS_URL + `/initialisation/configure`, defaultCurrency).pipe(share())
  // }

  /**
   *  Method that initialize all the system base components, entities 
   * @param
   * @return null
   */
  initialize(init: string): Observable<RequestResultDto<any>>{
    return this.http.post(API_URLS.CUSTOMERS_URL + `/initialisation/initialise-system`, init).pipe(share())
  }
}
