import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, share } from 'rxjs';
import { API_URLS } from '../../config/app.url.config';
import { AuthentificationDto } from '../dtos/authentification-dto.modal';
import { LoginDto } from '../dtos/login-dto.modal ';
import { ResponseDto } from '../dtos/response-dto.modal';
import { RequestResultDto } from '../dtos/request-result-dto.modal';
import { ResetPasswordDto } from '../dtos/reset-password-dto.modal';
import { User } from '../models/users/user.modal';
import { ValidateTokenResponseDto } from '../dtos/validate-token-response-dto.modal';
import { ActivateAccountDto } from '../dtos/activate-account-dto.modal';
import { CreateSuperAdminDto } from '../dtos/create-superadmin-dto.modal';
import { CreateAdminDto } from '../dtos/create-admin-dto.modal';
import { CreateWorkspaceWithAdminDto } from '../dtos/create-workspace-admin-dto.modal';
import { CreateEmployeeDto } from '../dtos/create-employee-dto.modal';
import { LogoutRequestDto } from '../dtos/logout-request-dto';

@Injectable({ providedIn: 'root' })
export class AuthentificationService {

  constructor(
    private http: HttpClient
  ) { }
  
  login(loginDto: LoginDto): Observable<RequestResultDto<User>> {
    return this.http.post<RequestResultDto<User>>(API_URLS.CUSTOMERS_URL + `/auth/login`, loginDto).pipe(share());
  }
  
  resetPassword(loginDto: LoginDto): Observable<ResponseDto<LoginDto>> {
    return this.http.post(API_URLS.CUSTOMERS_URL + `/reset-password`, loginDto).pipe(share());
  }

  confirmUser(passwordDto:ResetPasswordDto):Observable<ResponseDto<User>>{
    return this.http.post(API_URLS.CUSTOMERS_URL + `/new-password`, passwordDto).pipe(share());
  }
  
  activateAccount(passwordDto:ResetPasswordDto):Observable<ResponseDto<User>>{
    return this.http.post(API_URLS.CUSTOMERS_URL + `/activate-account`, passwordDto).pipe(share());
  }

  validateActivationToken(token: string): Observable<RequestResultDto<ValidateTokenResponseDto>> {
    const params = new HttpParams().set('token', token);
    return this.http.get<RequestResultDto<ValidateTokenResponseDto>>(
      API_URLS.CUSTOMERS_URL + `/auth/users/activate`, 
      { params }
    ).pipe(share());
  }

  activateAccountWithToken(activateAccountDto: ActivateAccountDto): Observable<RequestResultDto<any>> {
    return this.http.post<RequestResultDto<any>>(
      API_URLS.CUSTOMERS_URL + `/auth/users/activate`, 
      activateAccountDto
    ).pipe(share());
  }

  createSuperAdmin(createSuperAdminDto: CreateSuperAdminDto): Observable<RequestResultDto<User>> {
    return this.http.post<RequestResultDto<User>>(
      API_URLS.CUSTOMERS_URL + `/auth/users/superadmin`,
      createSuperAdminDto
    ).pipe(share());
  }

  createAdmin(createAdminDto: CreateAdminDto): Observable<RequestResultDto<User>> {
    return this.http.post<RequestResultDto<User>>(
      API_URLS.CUSTOMERS_URL + `/auth/admins`,
      createAdminDto
    ).pipe(share());
  }

  createWorkspaceWithAdmin(createWorkspaceWithAdminDto: CreateWorkspaceWithAdminDto): Observable<RequestResultDto<any>> {
    return this.http.post<RequestResultDto<any>>(
      API_URLS.CUSTOMERS_URL + `/auth/workspace-admins/workspace`,
      createWorkspaceWithAdminDto
    ).pipe(share());
  }

  createEmployee(createEmployeeDto: CreateEmployeeDto): Observable<RequestResultDto<User>> {
    return this.http.post<RequestResultDto<User>>(
      API_URLS.CUSTOMERS_URL + `/auth/users/employee`,
      createEmployeeDto
    ).pipe(share());
  }

  logout(logoutRequestDto: LogoutRequestDto): Observable<RequestResultDto<any>> {
    return this.http.post<RequestResultDto<any>>(
      API_URLS.CUSTOMERS_URL + `/auth/logout`,
      logoutRequestDto
    ).pipe(share());
  }
}

		
			
