import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, share } from 'rxjs';
import { API_URLS } from '../../config/app.url.config';
import { AuthentificationDto } from '../dtos/authentification-dto.modal';
import { LoginDto } from '../dtos/login-dto.modal ';
import { ResponseDto } from '../dtos/response-dto.modal';
import { RequestResultDto } from '../dtos/request-result-dto.modal';
import { ResetPasswordDto } from '../dtos/reset-password-dto.modal';
import { ResetPasswordWithTokenDto } from '../dtos/reset-password-with-token-dto.modal';
import { EmailDto } from '../dtos/email-dto';
import { User } from '../models/users/user.modal';
import { ValidateTokenResponseDto } from '../dtos/validate-token-response-dto.modal';
import { ActivateAccountDto } from '../dtos/activate-account-dto.modal';
import { CreateSuperAdminDto } from '../dtos/create-superadmin-dto.modal';
import { CreateAdminDto } from '../dtos/create-admin-dto.modal';
import { CreateWorkspaceWithAdminDto } from '../dtos/create-workspace-admin-dto.modal';
import { CreateEmployeeDto } from '../dtos/create-employee-dto.modal';
import { LogoutRequestDto } from '../dtos/logout-request-dto';
import { ResendInvitationDto } from '../dtos/resend-invitation-dto.modal';
import { InvitationListRequestDto } from '../dtos/invitation-list-request-dto.modal';
import { InvitationResponseDto, InvitationListResponseDto } from '../dtos/invitation-response-dto.modal';

@Injectable({ providedIn: 'root' })
export class AuthentificationService {

  constructor(
    private http: HttpClient
  ) { }
  
  login(loginDto: LoginDto): Observable<RequestResultDto<User>> {
    return this.http.post<RequestResultDto<User>>(API_URLS.CUSTOMERS_URL + `/auth/login`, loginDto).pipe(share());
  }
  
  /**
   * Ancien endpoint de reset password (non utilisé dans le nouveau flux)
   * Conservé pour compatibilité potentielle.
   */
  resetPasswordLegacy(loginDto: LoginDto): Observable<ResponseDto<LoginDto>> {
    return this.http.post(API_URLS.CUSTOMERS_URL + `/reset-password`, loginDto).pipe(share());
  }

  confirmUser(passwordDto:ResetPasswordDto):Observable<ResponseDto<User>>{
    return this.http.post(API_URLS.CUSTOMERS_URL + `/new-password`, passwordDto).pipe(share());
  }
  
  activateAccount(passwordDto:ResetPasswordDto):Observable<ResponseDto<User>>{
    return this.http.post(API_URLS.CUSTOMERS_URL + `/activate-account`, passwordDto).pipe(share());
  }

  /**
   * Nouveau flux : reset password avec token + otp
   * Swagger: POST /api/auth/reset-password
   * body: { token, otp, newPassword }
   */
  resetPassword(resetPasswordDto: ResetPasswordWithTokenDto): Observable<RequestResultDto<string>> {
    return this.http.post<RequestResultDto<string>>(
      API_URLS.CUSTOMERS_URL + `/auth/reset-password`,
      resetPasswordDto
    ).pipe(share());
  }

  /**
   * Forgot password : envoi d'un email avec OTP / lien de réinitialisation
   * Swagger: POST /api/auth/forgot-password
   * body: { email }
   */
  forgotPassword(emailDto: EmailDto): Observable<RequestResultDto<string>> {
    return this.http.post<RequestResultDto<string>>(
      API_URLS.CUSTOMERS_URL + `/auth/forgot-password`,
      emailDto
    ).pipe(share());
  }

  validateActivationToken(token: string): Observable<RequestResultDto<ValidateTokenResponseDto>> {
    const params = new HttpParams().set('token', token);
    return this.http.get<RequestResultDto<ValidateTokenResponseDto>>(
      API_URLS.CUSTOMERS_URL + `/auth/invitations/activate`, 
      { params }
    ).pipe(share());
  }

  activateAccountWithToken(activateAccountDto: ActivateAccountDto): Observable<RequestResultDto<any>> {
    return this.http.post<RequestResultDto<any>>(
      API_URLS.CUSTOMERS_URL + `/auth/invitations/activate`, 
      activateAccountDto
    ).pipe(share());
  }

  resendInvitation(resendInvitationDto: ResendInvitationDto): Observable<RequestResultDto<string>> {
    return this.http.post<RequestResultDto<string>>(
      API_URLS.CUSTOMERS_URL + `/auth/invitations/resend`,
      resendInvitationDto
    ).pipe(share());
  }

  getInvitations(invitationListRequestDto: InvitationListRequestDto): Observable<RequestResultDto<InvitationListResponseDto>> {
    let params = new HttpParams();
    
    if (invitationListRequestDto.workspaceId) {
      params = params.set('workspaceId', invitationListRequestDto.workspaceId);
    }
    if (invitationListRequestDto.shopId) {
      params = params.set('shopId', invitationListRequestDto.shopId);
    }
    if (invitationListRequestDto.userType) {
      params = params.set('userType', invitationListRequestDto.userType);
    }
    if (invitationListRequestDto.status) {
      params = params.set('status', invitationListRequestDto.status);
    }
    if (invitationListRequestDto.search) {
      params = params.set('search', invitationListRequestDto.search);
    }
    if (invitationListRequestDto.page !== undefined) {
      params = params.set('page', invitationListRequestDto.page.toString());
    }
    if (invitationListRequestDto.size !== undefined) {
      params = params.set('size', invitationListRequestDto.size.toString());
    }
    if (invitationListRequestDto.sortBy) {
      params = params.set('sortBy', invitationListRequestDto.sortBy);
    }
    if (invitationListRequestDto.sortDirection) {
      params = params.set('sortDirection', invitationListRequestDto.sortDirection);
    }

    return this.http.get<RequestResultDto<InvitationListResponseDto>>(
      API_URLS.CUSTOMERS_URL + `/auth/invitations`,
      { params }
    ).pipe(share());
  }

  getInvitationById(invitationId: string): Observable<RequestResultDto<InvitationResponseDto>> {
    return this.http.get<RequestResultDto<InvitationResponseDto>>(
      API_URLS.CUSTOMERS_URL + `/auth/invitations/${invitationId}`
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

  /**
   * Changer le mot de passe de l'utilisateur courant
   * Swagger: POST /api/auth/change-password
   * Params (query): oldPassword, newPassword
   */
  changePassword(oldPassword: string, newPassword: string): Observable<RequestResultDto<string>> {
    const params = new HttpParams()
      .set('oldPassword', oldPassword)
      .set('newPassword', newPassword);

    return this.http.post<RequestResultDto<string>>(
      API_URLS.CUSTOMERS_URL + `/auth/change-password`,
      null,
      { params }
    ).pipe(share());
  }
}

		
			
