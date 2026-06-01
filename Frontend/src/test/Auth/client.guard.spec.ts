import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { clientGuard } from '../../services/auth/client.guard';
import { AuthService } from '../../services/auth/auth.service';

describe('ClientGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['isAuthenticatedUser', 'isAdmin']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ]
    });
  });

  it('should redirect admins to the admin panel', () => {
    authService.isAuthenticatedUser.and.returnValue(true);
    authService.isAdmin.and.returnValue(true);
    
    const result = TestBed.runInInjectionContext(() => clientGuard({} as any, {} as any));
    
    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('should allow navigation for regular clients', () => {
    authService.isAuthenticatedUser.and.returnValue(true);
    authService.isAdmin.and.returnValue(false);
    
    const result = TestBed.runInInjectionContext(() => clientGuard({} as any, {} as any));
    
    expect(result).toBeTrue();
  });
});
