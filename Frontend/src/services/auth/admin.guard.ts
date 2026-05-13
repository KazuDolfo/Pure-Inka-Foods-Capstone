import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // --- DEBUGGING STEP ---
  const currentUser = authService.getCurrentUser();
  console.log('AdminGuard Check: Current user object is ->', currentUser);
  // --- END DEBUGGING STEP ---

  // Centralize the logic in the service
  if (authService.isAdmin()) {
    return true;
  }

  // If not an admin, redirect to a suitable page (e.g., home or login)
  router.navigate(['/']);
  return false;
};
