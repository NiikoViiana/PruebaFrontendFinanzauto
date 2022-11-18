import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor() { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        const isApiUrl = request.url.startsWith(environment.apiUrl);

        if (isApiUrl) {
            request = request.clone({
                setHeaders: {
                    "app-id": `63473330c1927d386ca6a3a5`,
                    "Content-Type": 'application/json',
                }
            });
        }        

        return next.handle(request);
    }
}