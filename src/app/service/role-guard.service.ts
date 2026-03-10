import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class RoleGuard implements CanActivate {

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
        return this.checkRole(route);
    }

    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot)
        : boolean | Observable<boolean> | Promise<boolean> {
        return this.checkRole(childRoute);
    }

    checkRole(childRoute: ActivatedRouteSnapshot) {
        return this.authService.getCurrentUserFromServer().pipe(
            map(user => {
                const isPermitted = !!(childRoute.data?.['roles'] as string[]).find(role => role === user.role);
                if (!isPermitted) this.router.navigate(['/']);
                return isPermitted;
            })
        )
    }
}
