import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const clientGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si el usuario es administrador, no debería estar en páginas de cliente
  if (authService.isAuthenticatedUser() && authService.isAdmin()) {
    router.navigate(['/admin']);
    return false;
  }

  return true;
};
