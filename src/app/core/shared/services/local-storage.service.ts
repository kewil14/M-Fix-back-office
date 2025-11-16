import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { APP_ENUMS } from '../../config/app.enums.config';
import { User } from '../models/users/user.modal';
import { JwtHelperService } from '@auth0/angular-jwt';


@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  // private currentTokenSubject: BehaviorSubject<AuthentificationDto>;
  private currentTokenFinSubject: BehaviorSubject<string | undefined>;
  private currentUserSubject: BehaviorSubject<User | undefined>;
  // public currentToken: Observable<AuthentificationDto>;
  public currentToken: Observable<string | undefined>;

  private localLangSubject: BehaviorSubject<string>;
  public localLang: Observable<string>;

  constructor(
  ) {
    // Initialiser le token depuis localStorage au démarrage
    const storedToken = localStorage.getItem(APP_ENUMS.PREFIX_TOKEN) || '';
    this.currentTokenFinSubject = new BehaviorSubject<string | undefined>(storedToken || undefined);
    this.currentUserSubject = new BehaviorSubject<User | undefined>({});
    
    this.currentToken = this.currentTokenFinSubject.asObservable();

    this.localLangSubject = new BehaviorSubject<string>(localStorage.getItem(APP_ENUMS.PREFIX_LOCAL_LANG) || APP_ENUMS.PREFIX_DEFAULT_LANGUAGE);
    this.localLang = this.localLangSubject.asObservable();
  }

  public get localLangValue(): string {
    console.log('la langue que je recupere', this.localLangSubject.value);
    return this.localLangSubject.value;
  }

  public setLocalLangValue(lang: string): void {
    localStorage.setItem(APP_ENUMS.PREFIX_LOCAL_LANG , lang);
    this.localLangSubject.next(lang);
  }

  public get currentTokenValueFin(): string | undefined {
    // Récupérer le token depuis localStorage et mettre à jour le BehaviorSubject si nécessaire
    const storedToken = localStorage.getItem(APP_ENUMS.PREFIX_TOKEN);
    if (storedToken !== this.currentTokenFinSubject.value) {
      this.currentTokenFinSubject.next(storedToken || undefined);
    }
    return this.currentTokenFinSubject.value;
  }

  public setCurrentTokenValueFin(token: string): void {
    localStorage.setItem(APP_ENUMS.PREFIX_TOKEN , token);
    this.currentTokenFinSubject.next(token);
  }

  public setRefreshToken(refreshToken: string): void {
    localStorage.setItem(APP_ENUMS.PREFIX_REFRESH_TOKEN, refreshToken);
  }

  public getRefreshToken(): string | null {
    return localStorage.getItem(APP_ENUMS.PREFIX_REFRESH_TOKEN);
  }

  public setCurrentUser(user: User){
    localStorage.setItem(APP_ENUMS.PREFIX_USER , JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  public get currentUserValue(): any {
    const value = localStorage.getItem(APP_ENUMS.PREFIX_USER);
    if (value) {
      try {
        return JSON.parse(value);
      } catch (e) {
        console.error('Erreur JSON dans localStorage (currentUser)', e);
        return null;
      }
    }
    return null;
  }

  public isUserStorage(): boolean{
    if(localStorage.getItem(APP_ENUMS.PREFIX_USER)){
      return true;
    }else{
      return false;
    }
  }

  // getRoles(): Array<any> {
  //   const jwt = this.currentTokenValue?.jwt|| '';
  //   const jwtHelper = new JwtHelperService();
  //   return jwtHelper.decodeToken(jwt)?.roles;
  // }
  getRolesFin(): any {
    const jwt = this.currentTokenValueFin || '';
    const jwtHelper = new JwtHelperService();
    // console.log(jwtHelper.decodeToken(jwt));
    return jwtHelper.decodeToken(jwt);
  }

  // isTokenExpired(): boolean {
  //   const jwt = this.currentTokenValue?.jwt || '';
  //   const jwtHelper = new JwtHelperService();
  //   if (jwtHelper.isTokenExpired(jwt)) {
  //     this.logout();
  //   }
  //   return jwtHelper.isTokenExpired(jwt);
  // }

  // isTokenExpiredFin(): boolean {
  //   const jwt = this.currentTokenValueFin || '';
  //   console.log('voici le jwt:', jwt);
  //   const jwtHelper = new JwtHelperService();
  //   // if (jwtHelper.isTokenExpired(jwt)) {
  //   //   this.logout();
  //   // }
  //   return jwtHelper.isTokenExpired(jwt);
  // }

  isTokenExpiredFin(): boolean {
    const jwt = this.currentTokenValueFin;
    console.log('isTokenExpired',jwt);
    if (jwt != '' && jwt != undefined && jwt != null) {
      return false;
    } else {
      return true;
    }
  }

  // getSubject(): string {
  //   const jwt = this.currentTokenValue?.jwt || '';
  //   const jwtHelper = new JwtHelperService();
  //   return jwtHelper.decodeToken(jwt)?.sub;
  // }
  getSubjectFin(): string {
    const jwt = this.currentTokenValueFin || '';
    const jwtHelper = new JwtHelperService();
    return jwtHelper.decodeToken(jwt)?.sub;
  }

  // hasRole(roles: Array<any>): boolean {
  //   if (!roles || !roles[0]) return true;
  //   for (const rol of this.getRoles()) {
  //     if (roles.includes(rol.authority)) {
  //       return true;
  //     }
  //   }
  //   return false;
  // }

  hasRoleFin(roles: Array<any>): boolean {
    if (!roles || !roles[0]) return true;
    for (const rol of this.getRolesFin()) {
      if (roles.includes(rol.roles)) {
        return true;
      }
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem(APP_ENUMS.PREFIX_TOKEN);
    localStorage.removeItem(APP_ENUMS.PREFIX_REFRESH_TOKEN);
    localStorage.removeItem(APP_ENUMS.PREFIX_USER);
    this.currentTokenFinSubject.next(undefined);
    this.currentUserSubject.next(undefined);
  }

  dbOptions(): any {
    return {
      pagingType: 'full_numbers',
      pageLength: 5,
      lengthMenu : [5,10, 25, 50],
      processing: true,
      responsive: true,
      order: [[3, 'desc']],
    }
  }

}
