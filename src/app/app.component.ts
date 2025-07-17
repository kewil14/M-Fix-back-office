import { Component , OnInit} from '@angular/core';
import { APP_ENUMS } from './core/config/app.enums.config';
import { LanguageService } from './core/services/language.service';
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
    private localStorageService: LocalStorageService,
    private actionService: Actions,
  ){
    this.languageService.setLanguage(APP_ENUMS.PREFIX_DEFAULT_LANGUAGE);
    // this.languageService.use(this.localStorageService.localLangValue);
    document.documentElement.lang = this.localStorageService.localLangValue;
  }

  ngOnInit() {
    // document.getElementsByTagName("html")[0].setAttribute("dir", "rtl");
  }
}
