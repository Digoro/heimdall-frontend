import { User } from '@/model/user';
import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<User | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  login(email: string, password: string) {
    return this.http.post<{ user: User }>('/auth/login', { email, password })
      .pipe(
        tap(resp => {
          this.currentUser.set(resp.user);
        })
      )
  }

  refresh() {
    return this.http.post('/auth/refresh', {});
  }

  logout() {
    return this.http.post('/auth/logout', {}).subscribe(resp => {
      this.currentUser.set(null);
      this.router.navigate(['/login']);
    })
  }

  checkAuth() {
    return this.http.get<User>('/auth/me').pipe(
      tap((user) => {
        this.currentUser.set(user);
      }),
      catchError(() => {
        this.currentUser.set(null);
        return of(null);
      })
    )
  }
}
