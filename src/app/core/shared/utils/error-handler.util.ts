import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

/**
 * Vérifie si l'erreur est une erreur HTTP critique (401, 403) qui doit être gérée par l'interceptor
 * @param error L'erreur à vérifier
 * @returns true si l'erreur doit être laissée à l'interceptor, false sinon
 */
export function isCriticalHttpError(error: any): boolean {
  return error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403);
}

/**
 * Gère les erreurs dans les effects NgRx
 * Si c'est une erreur HTTP critique (401, 403), la re-throw pour que l'interceptor puisse la gérer
 * Sinon, retourne une action d'erreur
 * @param error L'erreur à gérer
 * @param errorAction L'action d'erreur à retourner si ce n'est pas une erreur critique
 * @returns Observable de l'action d'erreur ou throw l'erreur
 */
export function handleErrorInEffect<T>(error: any, errorAction: T): Observable<T> {
  if (isCriticalHttpError(error)) {
    // Re-throw pour que l'interceptor puisse gérer les erreurs 401/403
    console.log('Erreur HTTP critique détectée, laisser l\'interceptor gérer:', error.status);
    return throwError(() => error);
  }
  // Pour les autres erreurs, retourner l'action d'erreur
  return throwError(() => error);
}

