import { Injectable, inject } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LocalStorageService } from '../services/local-storage.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    private router = inject(Router);
    private localStorageService = inject(LocalStorageService);

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            catchError((err: HttpErrorResponse) => {
                console.log('ErrorInterceptor - Erreur interceptée:', err.status, err.url, err);

                // Vérifier que c'est bien une HttpErrorResponse
                if (!(err instanceof HttpErrorResponse)) {
                    console.log('ErrorInterceptor - Erreur n\'est pas une HttpErrorResponse');
                    return throwError(() => err);
                }

                // Gestion des erreurs 401 (Unauthorized)
                if (err.status === 401) {
                    console.error('ErrorInterceptor - Erreur 401 - Non autorisé, déconnexion...');
                    this.localStorageService.logout();
                    // Redirection immédiate sans setTimeout pour éviter les conflits
                    this.router.navigate(['/'], { replaceUrl: true }).then(() => {
                        console.log('ErrorInterceptor - Redirection vers login effectuée');
                    }).catch(error => {
                        console.error('ErrorInterceptor - Erreur lors de la redirection:', error);
                    });
                    return throwError(() => err);
                }

                // Gestion des erreurs 403 (Forbidden) - Laisser passer sans redirection
                if (err.status === 403) {
                    console.error('ErrorInterceptor - Erreur 403 - Accès refusé');
                    // Ne pas rediriger, laisser le composant gérer l'erreur
                }

                // Gestion des erreurs 404 (Not Found)
                if (err.status === 404) {
                    console.error('ErrorInterceptor - Erreur 404 - Ressource non trouvée:', err.url);
                    // Ne pas rediriger automatiquement pour les 404, laisser le composant gérer
                }

                // Gestion des erreurs 500 (Internal Server Error)
                if (err.status === 500) {
                    console.error('ErrorInterceptor - Erreur 500 - Erreur serveur:', err);
                    // Optionnel: rediriger vers la page 500
                    // this.router.navigate(['/pages/500'], { replaceUrl: false });
                }

                // Pour les autres erreurs, retourner l'erreur avec le message approprié
                const errorMessage = err.error?.message || err.error?.error || err.statusText || 'Une erreur est survenue';
                return throwError(() => new Error(errorMessage));
            })
        );
    }
}
