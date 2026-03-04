import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CookieService } from 'ngx-cookie-service';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly OMS_ACCESS_TOKEN = 'oms_access_token';

  constructor(
    private http: HttpClient,
    private jwtHelper: JwtHelperService,
    private cookieService: CookieService
  ) { }

  login(email: string, password: string) {
    return this.http.post<{ accessToken: string }>('/auth/login', { email, password })
      .pipe(
        tap(res => {
          this.setToken(res.accessToken);
        })
      )
  }

  setToken(token: string) {
    this.removeToken();
    const now = new Date()
    now.setHours(now.getHours() + 1);
    this.cookieService.set(this.OMS_ACCESS_TOKEN, token, { expires: now });
  }

  removeToken(): void {
    this.cookieService.delete(this.OMS_ACCESS_TOKEN)
  }

  logout() {
    this.cookieService.delete(this.OMS_ACCESS_TOKEN);
  }

  get token() {
    return this.cookieService.get(this.OMS_ACCESS_TOKEN);
  }

  isAuthenticated(): boolean {
    const token = this.token;
    return token ? !this.jwtHelper.isTokenExpired(token) : false;
  }
}
