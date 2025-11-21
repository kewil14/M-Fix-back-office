import { Component , OnInit} from '@angular/core';
import { APP_ENUMS } from './core/config/app.enums.config';
import { LanguageService } from './core/services/language.service';
import { ThemeService } from './core/services/theme.service';
import { LocalStorageService } from './core/shared/services/local-storage.service';
import { Actions } from '@ngrx/effects';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit  {

  constructor(
    private translateService: TranslateService,
    private languageService: LanguageService,
    private themeService: ThemeService,
    private localStorageService: LocalStorageService,
    private actionService: Actions,
  ){
    // Le LanguageService initialise déjà la langue dans son constructeur
    // On s'assure juste que la langue est bien définie
    const savedLang = this.localStorageService.localLangValue || this.languageService.translate.currentLang || 'fr';
    if (!this.languageService.translate.currentLang) {
      this.languageService.setLanguage(savedLang);
    }
    // Initialiser le thème (sera appliqué automatiquement par le service)
    this.themeService.theme$.subscribe();
    document.documentElement.lang = savedLang;
  }

  ngOnInit() {
    // document.getElementsByTagName("html")[0].setAttribute("dir", "rtl");
  }
}
