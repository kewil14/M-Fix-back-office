import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, share } from 'rxjs';
import { API_URLS } from '../../config/app.url.config';
import { UserResponseDto } from '../dtos/user-response-dto.modal';
import { RequestResultDto } from '../dtos/request-result-dto.modal';
import { RequestResultPaginateDto } from '../dtos/request-result-paginate-dto.modal';
import { UserRequestDto } from '../dtos/user-request-dto.modal';

@Injectable({ providedIn: 'root' })
export class UserService {

  constructor(
    private http: HttpClient
  ) { }
  
  /**
   * The Service get all the customers
   * @param 
   * @returns Observable<UserResponseDto>
   */
  getAllCustomer(state?: string, userType?: string, page?: number, size?: number, sort?: string): Observable<RequestResultDto<RequestResultPaginateDto<UserResponseDto[]>>> {
    let params = new HttpParams();
    if (state) params = params.append('state', state);
    if (userType) params = params.append('userType', userType);
    if (page !== undefined) params = params.append('page', page.toString());
    if (size !== undefined) params = params.append('size', size.toString());
    if (sort) params = params.append('sort', sort);

    return this.http.get(API_URLS.CUSTOMERS_URL + `/users/all-with-filters`, {params}).pipe(share());
  }


  /**
   * The Service update the customer
   * @param 
   * @returns Observable<UserResponseDto>
   */
  updateCustomer(user: UserResponseDto): Observable<RequestResultDto<UserResponseDto>> {
    return this.http.put(API_URLS.CUSTOMERS_URL + `/users/update`, user).pipe(share());
  }

  /**
   * delete customer
   * @param
   * @returns Observable<RequestResultDto<string>>
   */
  deleteCustomer(userCode: string): Observable<RequestResultDto<UserResponseDto>> {
    return this.http.delete(API_URLS.CUSTOMERS_URL + `/users/delete?userCode=${userCode}`).pipe(share());
  }
  
  /**
   * Le service connect
   * @param loginDto 
   * @returns Observable<ResponseDto<LoginDto>>
   */
  connectedUser(): Observable<RequestResultDto<UserResponseDto>> {
    return this.http.get(API_URLS.CUSTOMERS_URL + `/users/connectedUser`).pipe(share());
  }


  /**
   * The Service create the customer
   * @param 
   * @returns Observable<UserResponseDto>
   */
  createCustomer(user: UserRequestDto): Observable<RequestResultDto<UserResponseDto>> {
    return this.http.post(API_URLS.CUSTOMERS_URL + `/authentication/createAccount`, user).pipe(share());
  }

  
}






		
			
