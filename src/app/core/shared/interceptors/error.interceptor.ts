import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LocalStorageService } from '../services/local-storage.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    constructor(
        private localStorageService: LocalStorageService
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            // if (err.status === 401) {
            //     this.localStorageService.logout()
            //     location.reload();
            // }
            const error = err.error?.message || err?.statusText;
            return throwError(error);
        }))
    }
}
