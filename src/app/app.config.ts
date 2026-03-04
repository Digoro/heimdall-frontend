import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { JWT_OPTIONS, JwtModule } from '@auth0/angular-jwt';
import { CookieService } from 'ngx-cookie-service';
import { routes } from './app.routes';
import { provideZard } from './shared/core';

export function jwtOptionsFactory(cookieService: CookieService) {
  return {
    tokenGetter: () => { return cookieService.get('oms_access_token'); }
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    CookieService,
    provideZard(),
    importProvidersFrom(
      JwtModule.forRoot({
        jwtOptionsProvider: {
          provide: JWT_OPTIONS,
          useFactory: jwtOptionsFactory,
          deps: [CookieService]
        }
      })
    )
  ]
};
