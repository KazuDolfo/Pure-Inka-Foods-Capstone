import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Auth } from '../../app/pages/auth/auth';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

describe('Auth Component', () => {
  let component: Auth;
  let fixture: ComponentFixture<Auth>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Auth],
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Auth);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should validate email format using regex', () => {
    component.currentView.set('register');
    
    // Invalid email
    component.registerData.email = 'invalid-email';
    component.signUp();
    expect(component.authMessage).toBe('El formato del correo electrónico no es válido.');
    
    // Valid email, but short password (added recently)
    component.registerData.email = 'test@example.com';
    component.registerData.password = '123';
    component.registerData.confirmPassword = '456';
    component.signUp();
    expect(component.authMessage).toBe('La contraseña debe tener al menos 6 caracteres.');

    // Valid email, valid length, but mismatch
    component.registerData.password = '123456';
    component.registerData.confirmPassword = '654321';
    component.signUp();
    expect(component.authMessage).toBe('Las contraseñas no coinciden.');
  });
});
