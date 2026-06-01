
import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  isMobileMenuOpen = signal(false);
  
  public authService = inject(AuthService);
  public cartService = inject(CartService);
  private router = inject(Router);

  cartItemCount = computed(() =>
    this.cartService.getCartItems().reduce((sum, item) => sum + item.quantity, 0)
  );

  get homeLink(): string {
    return this.authService.isAdmin() ? '/admin' : '/';
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(value => !value);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  
  
  navigateToHome(): void {
    this.router.navigate([this.homeLink]);
    this.closeMobileMenu();
  }
}
