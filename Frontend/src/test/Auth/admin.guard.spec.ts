import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { adminGuard } from '../../services/auth/admin.guard';
import { AuthService } from '../../services/auth/auth.service';
import { of } from 'rxjs';

describe('AdminGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['isAdmin', 'getCurrentUser']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ]
    });
  });

  it('should allow navigation for admin users', () => {
    authService.isAdmin.and.returnValue(true);
    
    // We call the guard function (it's a CanActivateFn)
    const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
    
    expect(result).toBeTrue();
  });

  it('should redirect to home for non-admin users', () => {
    authService.isAdmin.and.returnValue(false);
    
    const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
    
    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});
