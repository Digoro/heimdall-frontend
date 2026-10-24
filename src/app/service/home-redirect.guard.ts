import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Role } from '@/model/user';
import { AuthService } from './auth.service';

// 홈('/') 진입 시 역할별 첫 화면으로 보낸다: Admin → Order Management, User → Imagery Search
export const homeRedirectGuard: CanActivateFn = () => {
  const user = inject(AuthService).currentUser();
  const router = inject(Router);

  if (!user) {
    return router.createUrlTree(['/login']);
  }
  return router.createUrlTree([user.role === Role.ADMIN ? '/orders' : '/imagery-search']);
};
