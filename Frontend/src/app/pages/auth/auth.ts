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
  currentView = signal<'login' | 'register' | 'recovery'>('login');
  recoveryStep = signal<1 | 2 | 3>(1);
  showAdminModal = signal(false);

  loginData = { email: '', password: '' };
  registerData = { name: '', email: '', password: '', confirmPassword: '' };
  adminLoginData = { email: '', password: '' };
  
  recoveryData = {
    identifier: '', 
    code: '',
    newPassword: '',
    confirmPassword: ''
  };

  isSubmitting = false;
  authMessage: string | null = null;
  messageType: 'success' | 'error' | null = null;

  isSubmittingAdmin = false;
  adminAuthMessage: string | null = null;
  adminMessageType: 'success' | 'error' | null = null;

  private authService = inject(AuthService);
  private router = inject(Router);

  switchView(view: 'login' | 'register' | 'recovery'): void {
    this.currentView.set(view);
    this.recoveryStep.set(1);
    this.authMessage = null;
    this.messageType = null;
  }

  sendRecoveryCode(): void {
    if (!this.recoveryData.identifier) {
      this.authMessage = 'Ingresa tu correo o teléfono.';
      this.messageType = 'error';
      return;
    }

    this.isSubmitting = true;
    this.authService.forgotPassword(this.recoveryData.identifier).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.authMessage = res.message || null;
        this.messageType = 'success';
        this.recoveryStep.set(2);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.authMessage = err.error?.message || 'Error al enviar código.';
        this.messageType = 'error';
      }
    });
  }

  verifyCode(): void {
    if (!this.recoveryData.code || this.recoveryData.code.length !== 6) {
      this.authMessage = 'Ingresa el código de 6 dígitos.';
      this.messageType = 'error';
      return;
    }

    this.isSubmitting = true;
    this.authService.verifyCode(this.recoveryData.identifier, this.recoveryData.code).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.authMessage = 'Código verificado. Ingresa tu nueva contraseña.';
        this.messageType = 'success';
        this.recoveryStep.set(3);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.authMessage = err.error?.message || 'Código incorrecto.';
        this.messageType = 'error';
      }
    });
  }

  resetPassword(): void {
    if (this.recoveryData.newPassword.length < 6) {
      this.authMessage = 'La contraseña debe tener al menos 6 caracteres.';
      this.messageType = 'error';
      return;
    }

    if (this.recoveryData.newPassword !== this.recoveryData.confirmPassword) {
      this.authMessage = 'Las contraseñas no coinciden.';
      this.messageType = 'error';
      return;
    }

    this.isSubmitting = true;
    this.authService.resetPassword({
      identifier: this.recoveryData.identifier,
      code: this.recoveryData.code,
      newPassword: this.recoveryData.newPassword
    }).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        alert('Contraseña restablecida con éxito. Inicia sesión.');
        this.switchView('login');
      },
      error: (err) => {
        this.isSubmitting = false;
        this.authMessage = err.error?.message || 'Error al restablecer.';
        this.messageType = 'error';
      }
    });
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
    this.authService.login(this.adminLoginData, true).subscribe({
      next: () => {
        this.isSubmittingAdmin = false;
        this.router.navigate(['/admin']);
        this.closeAdminModal();
      },
      error: (err) => {
        this.isSubmittingAdmin = false;
        this.adminAuthMessage = err.error?.message || 'Error en el acceso admin.';
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
    this.authService.login(this.loginData, false).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.authMessage = err.error?.message || 'Error al iniciar sesión.';
        this.messageType = 'error';
      }
    });
  }

  signUp(): void {
    const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
    if (!emailRegex.test(this.registerData.email)) {
      this.authMessage = 'El formato del correo electrónico no es válido.';
      this.messageType = 'error';
      return;
    }

    if (!this.registerData.password || this.registerData.password.length < 6) {
      this.authMessage = 'La contraseña debe tener al menos 6 caracteres.';
      this.messageType = 'error';
      return;
    }

    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.authMessage = 'Las contraseñas no coinciden.';
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

