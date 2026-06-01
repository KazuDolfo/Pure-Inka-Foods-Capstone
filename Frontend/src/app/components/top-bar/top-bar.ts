import { Component, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../../../services/cart.service';
import { AuthService } from '../../../services/auth/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './top-bar.html',
  styleUrls: ['./top-bar.scss']
})
export class TopBar {
  cartItems = computed(() => this.cartService.getCartItems());
  cartItemCount = computed(() =>
    this.cartService.getCartItems().reduce((sum, item) => sum + item.quantity, 0)
  );
  cartTotal = computed(() =>
    this.cartService.getCartItems().reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  
  aggregatedCartItems = computed(() => this.cartService.getAggregatedItems());

  isAuthenticated = computed(() => this.authService.isAuthenticatedUser());
  showCartDropdown = signal(false);

  constructor(
    public cartService: CartService,
    public authService: AuthService,
    private router: Router
  ) {
    effect(() => {
      if (this.isAuthenticated()) {
        this.cartService.syncCartOnLogin();
      }
    });
  }

  toggleCartDropdown() {
    this.showCartDropdown.set(!this.showCartDropdown());
  }

  closeCartDropdown() {
    this.showCartDropdown.set(false);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }

  removeItem(itemId: number) {
    this.cartService.removeFromCart(itemId);
  }

  increaseQuantity(itemId: number) {
    const item = this.cartService.getCartItems().find(i => i.id === itemId);
    if (item) this.cartService.updateQuantity(itemId, item.quantity + 1);
  }

  decreaseQuantity(itemId: number) {
    const item = this.cartService.getCartItems().find(i => i.id === itemId);
    if (item && item.quantity > 1) {
      this.cartService.updateQuantity(itemId, item.quantity - 1);
    } else if (item && item.quantity === 1) {
      this.removeItem(itemId);
    }
  }

  get formattedCartTotal() {
    return `S/. ${this.cartTotal().toFixed(2)}`;
  }

  
  getImageUrl(image?: string): string {
    if (!image) return 'assets/pure-inka-logo.png';

    
    if (image.startsWith('/') || 
        image.startsWith('http') || 
        image.startsWith('assets/')) {
      return image;
    }

    
    if (!image.includes('/')) {
      return `/public/uploads/products/${image}`;
    }

    
    return `assets/${image}`;
  }

  onImageError(event: any): void {
    if (event?.target) {
      event.target.src = 'assets/pure-inka-logo.png';
    }
  }
}
