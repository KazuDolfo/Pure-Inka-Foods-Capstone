
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

export const authGuard: CanActivateFn = (route) => {
  const authService = inject<AuthService>(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticatedUser()) {
    
    if (authService.isAdmin() && route.routeConfig?.path === 'checkout') {
      router.navigate(['/admin']);
      return false;
    }
    return true;
  } else {
    router.navigate(['/auth']);
    return false;
  }
};

