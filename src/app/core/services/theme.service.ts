import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

export type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private themeSubject: BehaviorSubject<ThemeMode>;
  public theme$: Observable<ThemeMode>;

  constructor(private cookieService: CookieService) {
    // Récupérer le thème depuis le cookie ou utiliser 'light' par défaut
    const savedTheme = this.cookieService.get('theme') as ThemeMode;
    const initialTheme = (savedTheme === 'dark' || savedTheme === 'light') ? savedTheme : 'light';
    
    this.themeSubject = new BehaviorSubject<ThemeMode>(initialTheme);
    this.theme$ = this.themeSubject.asObservable();
    
    // Appliquer le thème initial
    this.applyTheme(initialTheme);
  }

  get currentTheme(): ThemeMode {
    return this.themeSubject.value;
  }

  setTheme(theme: ThemeMode): void {
    this.themeSubject.next(theme);
    this.cookieService.set('theme', theme, { expires: 365 }); // Cookie valide 1 an
    this.applyTheme(theme);
  }

  toggleTheme(): void {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  private applyTheme(theme: ThemeMode): void {
    const body = document.body;
    const html = document.documentElement;

    if (theme === 'dark') {
      body.classList.add('dark-mode');
      html.setAttribute('data-layout-mode', 'dark');
    } else {
      body.classList.remove('dark-mode');
      html.removeAttribute('data-layout-mode');
    }
  }
}

