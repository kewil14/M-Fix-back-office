import { Component, OnInit, Output, EventEmitter, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { AuthenticationService } from '../../core/services/auth.service';
import { AuthfakeauthenticationService } from '../../core/services/authfake.service';
import { environment } from '../../../environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { LanguageService } from '../../core/services/language.service';
import { ThemeService, ThemeMode } from '../../core/services/theme.service';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from 'src/app/core/shared/services/local-storage.service';
import { Store } from '@ngrx/store';
import { logout } from 'src/app/core/shared/stores/authentification/authentification.actions';
import { Actions, ofType } from '@ngrx/effects';
import { logoutOk } from 'src/app/core/shared/stores/authentification/authentification.actions';
import { take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { selectProfileState } from 'src/app/core/core.state';
import { ProfileState } from 'src/app/core/shared/stores/profile/profile.state';
import { setUserProfile } from 'src/app/core/shared/stores/profile/profile.actions';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})

/**
 * Topbar component
 */
export class TopbarComponent implements OnInit {

  element: any;
  cookieValue: any;
  flagvalue: any;
  countryName: any;
  valueset: any;
  currentTheme: ThemeMode = 'light';
  isDarkMode: boolean = false;
  profileState$: Observable<ProfileState>;
  user$: Observable<any>;

  constructor(
    @Inject(DOCUMENT) private document: any, 
    private router: Router, 
    private authService: AuthenticationService,
    private authFackservice: AuthfakeauthenticationService,
    public languageService: LanguageService,
    public themeService: ThemeService,
    public translate: TranslateService,
    public _cookiesService: CookieService,
    private localStorageService: LocalStorageService,
    private storeService: Store,
    private actionService: Actions,
  ) {
  }

  listLang = [
    { text: 'English', flag: 'assets/images/flags/us.jpg', lang: 'en' },
    { text: 'French', flag: 'assets/images/flags/french.jpg', lang: 'fr' },
    // { text: 'German', flag: 'assets/images/flags/germany.jpg', lang: 'de' },
    // { text: 'Italian', flag: 'assets/images/flags/italy.jpg', lang: 'it' },
    // { text: 'Russian', flag: 'assets/images/flags/russia.jpg', lang: 'ru' },
  ];

  openMobileMenu!: boolean;

  @Output() settingsButtonClicked = new EventEmitter();
  @Output() mobileMenuButtonClicked = new EventEmitter();

  ngOnInit() {
    this.openMobileMenu = false;
    this.element = document.documentElement;
    
    this.profileState$ = this.storeService.select(selectProfileState);
    
    this.user$ = this.profileState$.pipe(
      map(state => {
        if (state?.user && state.user && Object.keys(state.user).length > 0) {
          return this.normalizeUser(state.user);
        }
        const localUser = this.localStorageService.currentUserValue;
        if (localUser && Object.keys(localUser).length > 0) {
          const normalizedUser = this.normalizeUser(localUser);
          this.storeService.dispatch(setUserProfile({ user: normalizedUser }));
          return normalizedUser;
        }
        return null;
      })
    );

    this.cookieValue = this._cookiesService.get('lang');
    const val = this.listLang.filter(x => x.lang === this.cookieValue);
    this.countryName = val.length > 0 ? val[0].text : 'English';
    if (val.length === 0) {
      if (this.flagvalue === undefined) { this.valueset = 'assets/images/flags/us.jpg'; }
    } else {
      this.flagvalue = val[0].flag;
    }

    this.currentTheme = this.themeService.currentTheme;
    this.isDarkMode = this.currentTheme === 'dark';
    this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
      this.isDarkMode = theme === 'dark';
    });
  }

  normalizeUser(user: any): any {
    if (!user || Object.keys(user).length === 0) {
      return null;
    }
    return {
      id: user.id || user.userCode,
      userCode: user.userCode || user.id,
      email: user.email || user.userEmail,
      userEmail: user.userEmail || user.email,
      firstName: user.firstName || user.userFirstName || user.firstname,
      lastName: user.lastName || user.userLastName || user.lastname,
      userFirstName: user.userFirstName || user.firstName || user.firstname,
      userLastName: user.userLastName || user.lastName || user.lastname,
      firstname: user.firstName || user.userFirstName || user.firstname,
      lastname: user.lastName || user.userLastName || user.lastname,
      image: user.image || user.avatar,
      avatar: user.avatar || user.image,
      phoneNumber: user.phoneNumber || user.userPhoneNumber,
      userPhoneNumber: user.userPhoneNumber || user.phoneNumber,
      username: user.username,
      isActive: user.isActive,
      roles: user.roles,
      type: user.type
    };
  }

  setLanguage(text: string, lang: string, flag: string) {
    this.countryName = text;
    this.flagvalue = flag;
    this.cookieValue = lang;
    // Utiliser le service de langue qui gère tout
    this.languageService.setLanguage(lang);
    // Forcer l'utilisation de la langue dans TranslateService
    this.translate.use(lang).subscribe(() => {
      // Les traductions sont maintenant chargées et appliquées
    });
  }

  toggleDarkMode(): void {
    this.themeService.toggleTheme();
  }

  /**
   * Toggles the right sidebar
   */
  toggleRightSidebar() {
    this.settingsButtonClicked.emit();
  }

  /**
   * Toggle the menu bar when having mobile screen
   */
  toggleMobileMenu(event: any) {
    event.preventDefault();
    this.mobileMenuButtonClicked.emit();
  }

  logout() {
    this.storeService.dispatch(logout());
  }

  goToProfile() {
    this.router.navigate(['/pages/contacts/profile']);
  }

  lockScreen() {
    this.router.navigate(['/auth/lock-screen-1']);
  }

  /**
   * Fullscreen method
   */
  fullscreen() {
    document.body.classList.toggle('fullscreen-enable');
    if (
      !document.fullscreenElement && !this.element.mozFullScreenElement &&
      !this.element.webkitFullscreenElement) {
      if (this.element.requestFullscreen) {
        this.element.requestFullscreen();
      } else if (this.element.mozRequestFullScreen) {
        /* Firefox */
        this.element.mozRequestFullScreen();
      } else if (this.element.webkitRequestFullscreen) {
        /* Chrome, Safari and Opera */
        this.element.webkitRequestFullscreen();
      } else if (this.element.msRequestFullscreen) {
        /* IE/Edge */
        this.element.msRequestFullscreen();
      }
    } else {
      if (this.document.exitFullscreen) {
        this.document.exitFullscreen();
      } else if (this.document.mozCancelFullScreen) {
        /* Firefox */
        this.document.mozCancelFullScreen();
      } else if (this.document.webkitExitFullscreen) {
        /* Chrome, Safari and Opera */
        this.document.webkitExitFullscreen();
      } else if (this.document.msExitFullscreen) {
        /* IE/Edge */
        this.document.msExitFullscreen();
      }
    }
  }
}
