import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth {
  currentView = signal<'login' | 'register'>('login');
  showAdminModal = signal(false);

  loginData = { email: '', password: '' };
  registerData = { name: '', email: '', password: '', confirmPassword: '' };
  adminLoginData = { email: '', password: '' };

  isSubmitting = false;
  authMessage: string | null = null;
  messageType: 'success' | 'error' | null = null;

  isSubmittingAdmin = false;
  adminAuthMessage: string | null = null;
  adminMessageType: 'success' | 'error' | null = null;

  private authService = inject(AuthService);
  private router = inject(Router);

  switchView(view: 'login' | 'register'): void {
    this.currentView.set(view);
    this.authMessage = null;
    this.messageType = null;
  }

  openAdminModal(): void {
    this.showAdminModal.set(true);
    this.adminAuthMessage = null;
    this.adminMessageType = null;
  }

  closeAdminModal(): void {
    this.showAdminModal.set(false);
  }

  signInAdmin(): void {
    if (!this.adminLoginData.email || !this.adminLoginData.password) {
      this.adminAuthMessage = 'Por favor, completa todos los campos.';
      this.adminMessageType = 'error';
      return;
    }

    this.isSubmittingAdmin = true;
    this.authService.login(this.adminLoginData).subscribe({
      next: () => {
        this.isSubmittingAdmin = false;
        if (this.authService.isAdmin()) {
          this.router.navigate(['/admin']);
          this.closeAdminModal();
        } else {
          this.adminAuthMessage = 'No tienes permisos de administrador.';
          this.adminMessageType = 'error';
          this.authService.logout();
        }
      },
      error: (err) => {
        this.isSubmittingAdmin = false;
        this.adminAuthMessage = err.error?.message || 'Error de autenticaciÃ³n.';
        this.adminMessageType = 'error';
      }
    });
  }

  signIn(): void {
    if (!this.loginData.email || !this.loginData.password) {
      this.authMessage = 'Por favor, completa todos los campos.';
      this.messageType = 'error';
      return;
    }

    this.isSubmitting = true;
    this.authService.login(this.loginData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.authMessage = err.error?.message || 'Error al iniciar sesiÃ³n.';
        this.messageType = 'error';
      }
    });
  }

  signUp(): void {
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.authMessage = 'Las contraseÃ±as no coinciden.';
      this.messageType = 'error';
      return;
    }

    this.isSubmitting = true;
    const userData = {
      nombre: this.registerData.name,
      email: this.registerData.email,
      password: this.registerData.password
    };

    this.authService.register(userData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.authMessage = err.error?.message || 'Error al registrarse.';
        this.messageType = 'error';
      }
    });
  }
}
