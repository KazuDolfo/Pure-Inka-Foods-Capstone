import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from '../../services/auth/auth.service';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    httpMock = TestBed.inject(HttpTestingController);
    // No inyectamos 'service' aquí todavía para permitir que los tests preparen el LocalStorage
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should process login and handle user data properly', () => {
    service = TestBed.inject(AuthService);
    const mockUser = {
      id_usuario: 1,
      nombre: 'Bernardo',
      email: 'berna@test.com',
      rol: 'CLIENTE',
      telefono: '999888777',
      token: 'jwt-123'
    };

    service.login({ email: 'berna@test.com', password: 'password' }).subscribe(res => {
      expect(res.success).toBeTrue();
      expect(service.getCurrentUser()?.nombre).toBe('Bernardo');
      expect(service.getToken()).toBe('jwt-123');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/users/login`);
    req.flush({ success: true, data: mockUser });
  });

  it('should validate token and update profile on bootstrap', () => {
    localStorage.setItem('token', 'valid-token');
    
    // Al inyectar aquí, el constructor de AuthService se dispara y llama a validateToken()
    service = TestBed.inject(AuthService);
    
    const req = httpMock.expectOne(`${environment.apiUrl}/users/profile`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer valid-token');
    
    req.flush({
      success: true,
      data: { id_usuario: 1, nombre: 'Bernardo', email: 'berna@test.com', rol: 'CLIENTE', telefono: '999' }
    });

    expect(service.getCurrentUser()?.nombre).toBe('Bernardo');
  });

  it('should handle password recovery requests', () => {
    service = TestBed.inject(AuthService);
    service.forgotPassword('berna@test.com').subscribe(res => {
      expect(res.success).toBeTrue();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/users/forgot-password`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, message: 'Code sent' });
  });
});
