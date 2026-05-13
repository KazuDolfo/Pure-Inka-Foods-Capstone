// src/app/components/header/header.ts (COMPLETO)
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service'; // Asegúrate de que la ruta sea correcta

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  isMobileMenuOpen = signal(false);
  
  // Inyectamos el AuthService y Router
  private authService = inject(AuthService);
  private router = inject(Router);

  // Propiedad que devuelve el enlace correcto para el logo
  get homeLink(): string {
    // Si el usuario es administrador, devuelve '/admin'. Si no, devuelve '/'
    return this.authService.isAdmin() ? '/admin' : '/';
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(value => !value);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  // Si el header tiene lógica de navegación, se añadiría aquí.
  // Por ejemplo, para manejar el clic en el logo.
  navigateToHome(): void {
    this.router.navigate([this.homeLink]);
    this.closeMobileMenu();
  }
}