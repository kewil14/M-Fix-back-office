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
        // Endpoints d'activation de compte (publics - utilisés par les utilisateurs non authentifiés)
        '/api/auth/invitations/activate',
        // Endpoints publics qui ne nécessitent pas d'authentification
        '/api/avis',
        '/api/devis/findAll',
        '/api/users/all-with-filters',
        '/api/demands/create',
    ];

    constructor(
        private localStorageService: LocalStorageService
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Si l'URL est dans la liste des exclusions, passer la requête sans modification
        if (this.isExcludedUrl(request.url)) {
            return next.handle(request);
        }

        // Récupérer le token depuis le localStorage
        const token = this.localStorageService.currentTokenValueFin;

        // Si le token existe, l'ajouter dans le header Authorization
        if (token && token.trim() !== '') {
            // Cloner la requête et ajouter le header Authorization avec le token
            const clonedRequest = request.clone({
                setHeaders: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return next.handle(clonedRequest);
        }

        // Si pas de token mais que la requête nécessite une authentification,
        // on peut soit :
        // 1. Laisser passer la requête (le backend retournera 401)
        // 2. Rediriger vers login (mais cela peut causer des boucles)
        // Pour l'instant, on laisse passer et le backend gérera l'erreur 401
        console.warn('JwtInterceptor - Aucun token trouvé pour la requête:', request.url);
        return next.handle(request);
    }

    /**
     * Vérifie si l'URL est dans la liste des URLs exclues (endpoints publics)
     */
    private isExcludedUrl(url: string): boolean {
        return this.excludedUrls.some(excludedUrl => url.includes(excludedUrl));
    }
}

