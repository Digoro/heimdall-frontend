import { HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (req.url.includes('/auth') && !req.url.includes('/auth/me')) {
        return next(req.clone({ withCredentials: true }));
    }

    const reqWithCredentials = req.clone({ withCredentials: true });

    return next(reqWithCredentials).pipe(
        catchError(error => {
            if (error.status == HttpStatusCode.Unauthorized) {
                return authService.refresh().pipe(
                    switchMap(() => {
                        return next(reqWithCredentials);
                    }),
                    catchError(refreshError => {
                        authService.currentUser.set(null);
                        router.navigate(['/login']);
                        return throwError(() => refreshError);
                    })
                )
            }
            return throwError(() => error);
        })
    )
}