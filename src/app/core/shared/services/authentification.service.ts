import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, share } from 'rxjs';
import { API_URLS } from '../../config/app.url.config';
import { AuthentificationDto } from '../dtos/authentification-dto.modal';
import { LoginDto } from '../dtos/login-dto.modal ';
import { ResponseDto } from '../dtos/response-dto.modal';
import { ResetPasswordDto } from '../dtos/reset-password-dto.modal';
import { User } from '../models/users/user.modal';

@Injectable({ providedIn: 'root' })
export class AuthentificationService {

  constructor(
    private http: HttpClient
  ) { }
  
  /**
   * The Service makes it possible to authenticate a user
   * @param loginDto  /api/authentication/login
   * @returns Observable<AuthentificationDto>
   */
  login(loginDto: LoginDto): Observable<AuthentificationDto> {
    return this.http.post(API_URLS.CUSTOMERS_URL + `/authentication/login`, loginDto).pipe(share());
  }
  
  /**
   * Le service prends en parametre un loginDto et renvoie un email de reinitialisation de mot de passe a l'adress email fournie dans le username de loginDto
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
  
}






		
			
