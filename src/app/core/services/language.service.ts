import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  public languages: string[] = ['en', 'fr', 'es', 'de', 'it', 'ru'];

  constructor(public translate: TranslateService, private cookieService: CookieService) {
    let browserLang;
    this.translate.addLangs(this.languages);
    if (this.cookieService.check('lang')) {
      browserLang = this.cookieService.get('lang');
    }
    else {
      browserLang = translate.getBrowserLang() || 'en';
    }
    const supportedLang = browserLang.match(/en|fr|es|de|it|ru/) ? browserLang : 'en';
    translate.use(supportedLang).subscribe(() => {
      document.documentElement.lang = supportedLang;
    });
    if (!this.cookieService.check('lang')) {
      this.cookieService.set('lang', supportedLang, { expires: 365 });
    }
  }

  public setLanguage(lang: string) {
    this.cookieService.set('lang', lang, { expires: 365 });
    this.translate.use(lang).subscribe(() => {
      document.documentElement.lang = lang;
    });
  }

}
