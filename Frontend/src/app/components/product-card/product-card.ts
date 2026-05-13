// src/app/components/product-card/product-card.ts
import { Component, Input, computed } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { Product } from '../../../models';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './product-card.html',
  styleUrls: ['./product-card.css'] // ✅ corregido (plural)
})
export class ProductCard {
  @Input({ required: true }) product!: Product;

  protected readonly formattedPrice = computed(() => {
    const price = this.product.price;
    if (typeof price !== 'number' || isNaN(price)) {
      console.warn('Precio inválido detectado:', this.product);
      return 'S/. 0.00';
    }
    return `S/. ${price.toFixed(2)}`;
  });

  isAdded = false; // Estado para feedback visual

  constructor(private cartService: CartService) {}

  onAddToCart(): void {
    this.cartService.addToCart(this.product);
    this.isAdded = true;
    setTimeout(() => {
      this.isAdded = false;
    }, 1500);
  }

  isProductInCart = computed(() => {
    const cartItems = this.cartService.getCartItems();
    return cartItems.some(item => item.id === this.product.id);
  });

  productQuantityInCart = computed(() => {
    const cartItems = this.cartService.getCartItems();
    const item = cartItems.find(cartItem => cartItem.id === this.product.id);
    return item?.quantity || 0;
  });

  // ✅ Método para construir la URL de la imagen
  getImageUrl(): string {
    if (!this.product?.image) {
      return 'assets/pure-inka-logo.png';
    }

    // Si ya es una URL completa
    if (this.product.image.startsWith('http')) {
      return this.product.image;
    }

    // Si empieza con /public, en producción necesitamos la URL absoluta del backend
    if (this.product.image.startsWith('/public/')) {
      // Intentamos obtener la base del API (que suele ser el backend)
      const apiUrl = (window as any).env?.apiUrl || '/api';
      const baseHost = apiUrl.startsWith('http') 
        ? new URL(apiUrl).origin 
        : window.location.origin;

      // Si no estamos en el mismo host/puerto que el backend (ej: frontend en 4200 y backend en 5000)
      // pero esto depende de cómo esté desplegado. Por ahora, si empieza con / lo devolvemos tal cual
      // ya que ProductService ya se encargó de ponerle el host si era necesario en producción.
      return this.product.image;
    }

    if (this.product.image.startsWith('assets/')) {
      return this.product.image;
    }

    // Si es solo el nombre del archivo, asumir que está en uploads/products/ via proxy o ruta relativa
    if (!this.product.image.includes('/')) {
      return `/public/uploads/products/${this.product.image}`;
    }

    // Para otros casos, asumir que es una ruta relativa a assets
    return `assets/${this.product.image}`;
  }

  // ✅ Método para manejar error de imagen
  onImageError(event: any): void {
    if (event?.target) {
      event.target.src = 'assets/pure-inka-logo.png';
    }
  }
}
