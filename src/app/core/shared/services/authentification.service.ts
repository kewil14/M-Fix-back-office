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
  
  /**
   * The Service makes it possible to authenticate a user
   * @param loginDto  /api/auth/login
   * @returns Observable<RequestResultDto<User>>
   */
  login(loginDto: LoginDto): Observable<RequestResultDto<User>> {
    return this.http.post<RequestResultDto<User>>(API_URLS.CUSTOMERS_URL + `/auth/login`, loginDto).pipe(share());
  }
  
  /**
   * Le service prends en parametre un loginDto et renvoie un email de reinitialisation de mot de passe a l'adress email fournie dans l'email de loginDto
   * @param loginDto 
   * @returns Observable<ResponseDto<LoginDto>>
   */
  resetPassword(loginDto: LoginDto): Observable<ResponseDto<LoginDto>> {
    return this.http.post(API_URLS.CUSTOMERS_URL + `/reset-password`, loginDto).pipe(share());
  }

  /**
   * Le service prends en parametre un passwordDto et remplace le password par le passwordDto
   * @param passwordDto 
   * @returns Observable<ResponseDto<ResetPasswordDto>>
   */
  confirmUser(passwordDto:ResetPasswordDto):Observable<ResponseDto<User>>{
    return this.http.post(API_URLS.CUSTOMERS_URL + `/new-password`, passwordDto).pipe(share());
  }
  
  /**
   * Le service prends en parametre un passwordDto et active le compte de l'utilisateur par son email
   * @param passwordDto 
   * @returns Observable<ResponseDto<ResetPasswordDto>>
   */
  activateAccount(passwordDto:ResetPasswordDto):Observable<ResponseDto<User>>{
    return this.http.post(API_URLS.CUSTOMERS_URL + `/activate-account`, passwordDto).pipe(share());
  }

  /**
   * Valide un token d'invitation et retourne les informations de l'utilisateur si valide
   * @param token Le token d'invitation
   * @returns Observable<RequestResultDto<ValidateTokenResponseDto>>
   */
  validateActivationToken(token: string): Observable<RequestResultDto<ValidateTokenResponseDto>> {
    const params = new HttpParams().set('token', token);
    return this.http.get<RequestResultDto<ValidateTokenResponseDto>>(
      API_URLS.CUSTOMERS_URL + `/auth/users/activate`, 
      { params }
    ).pipe(share());
  }

  /**
   * Active un compte utilisateur en utilisant le token d'invitation et définit un nouveau mot de passe
   * @param activateAccountDto Le DTO contenant le token et le nouveau mot de passe
   * @returns Observable<RequestResultDto<any>>
   */
  activateAccountWithToken(activateAccountDto: ActivateAccountDto): Observable<RequestResultDto<any>> {
    return this.http.post<RequestResultDto<any>>(
      API_URLS.CUSTOMERS_URL + `/auth/users/activate`, 
      activateAccountDto
    ).pipe(share());
  }

  /**
   * Crée un SuperAdmin (nécessite ALLOW_SUPERADMIN_CREATION=true)
   * @param createSuperAdminDto Les données du SuperAdmin
   * @returns Observable<RequestResultDto<User>>
   */
  createSuperAdmin(createSuperAdminDto: CreateSuperAdminDto): Observable<RequestResultDto<User>> {
    return this.http.post<RequestResultDto<User>>(
      API_URLS.CUSTOMERS_URL + `/auth/users/superadmin`,
      createSuperAdminDto
    ).pipe(share());
  }

  /**
   * Crée un Admin (nécessite token SuperAdmin ou permission admins:create)
   * @param createAdminDto Les données de l'Admin
   * @returns Observable<RequestResultDto<User>>
   */
  createAdmin(createAdminDto: CreateAdminDto): Observable<RequestResultDto<User>> {
    return this.http.post<RequestResultDto<User>>(
      API_URLS.CUSTOMERS_URL + `/auth/admins`,
      createAdminDto
    ).pipe(share());
  }

  /**
   * Crée un Workspace avec son WorkspaceAdmin (nécessite permission workspaces:create)
   * @param createWorkspaceWithAdminDto Les données du workspace et de l'admin
   * @returns Observable<RequestResultDto<any>>
   */
  createWorkspaceWithAdmin(createWorkspaceWithAdminDto: CreateWorkspaceWithAdminDto): Observable<RequestResultDto<any>> {
    return this.http.post<RequestResultDto<any>>(
      API_URLS.CUSTOMERS_URL + `/auth/workspace-admins/workspace`,
      createWorkspaceWithAdminDto
    ).pipe(share());
  }

  /**
   * Crée un Employé (nécessite permission employees:create)
   * @param createEmployeeDto Les données de l'employé
   * @returns Observable<RequestResultDto<User>>
   */
  createEmployee(createEmployeeDto: CreateEmployeeDto): Observable<RequestResultDto<User>> {
    return this.http.post<RequestResultDto<User>>(
      API_URLS.CUSTOMERS_URL + `/auth/users/employee`,
      createEmployeeDto
    ).pipe(share());
  }

  /**
   * Déconnecte l'utilisateur de la session actuelle
   * @param logoutRequestDto Le DTO contenant le refreshToken
   * @returns Observable<RequestResultDto<any>>
   */
  logout(logoutRequestDto: LogoutRequestDto): Observable<RequestResultDto<any>> {
    return this.http.post<RequestResultDto<any>>(
      API_URLS.CUSTOMERS_URL + `/auth/logout`,
      logoutRequestDto
    ).pipe(share());
  }
  
}






		
			
