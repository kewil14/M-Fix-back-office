import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { LocalStorageService } from '../services/local-storage.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    private excludedUrls: string[] = [
        '/api/auth/login',
        '/api/authentication/login',
        '/api/initialisation/check-system-state',
        '/api/authentication/createAccount',
        // '/api/users/',
        // '/api/'
        '/api/avis',
        '/api/devis/findAll',
        '/api/users/all-with-filters',
        '/api/avis',
        '/api/demands/create',

    ];
    constructor(
        private localStorageService: LocalStorageService
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (this.isExcludedUrl(request.url)) {
            return next.handle(request); // Ignorer l'interception et passer la requête directement
          }
        var auth = this.localStorageService.currentTokenValueFin;

        const xhr = request.clone({ headers: request.headers.set('Authorization', `Bearer ${auth}`) });
        return next.handle(xhr);
    }
    private isExcludedUrl(url: string): boolean {
        return this.excludedUrls.some(excludedUrl => url.includes(excludedUrl));
      }
}

