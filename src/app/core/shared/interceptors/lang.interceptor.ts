import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_ENUMS } from '../../config/app.enums.config';

@Injectable()
export class LangInterceptor implements HttpInterceptor {
    constructor() {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const lang = localStorage.getItem(APP_ENUMS.PREFIX_LOCAL_LANG) || APP_ENUMS.PREFIX_EN;

        const lg = request.clone({
            setHeaders: {
                // 'Accept-Language': lang,
            }
        });

        return next.handle(lg);
    }
}
