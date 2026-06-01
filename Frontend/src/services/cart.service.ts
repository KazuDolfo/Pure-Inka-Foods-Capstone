import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Product, CartItem } from '../models';
import { AuthService } from './auth/auth.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private API_URL = `${environment.apiUrl}/cart`;

  private cart = signal<CartItem[]>([]);
  
  cartItemCount = computed(() =>
    this.cart().reduce((sum, item) => sum + item.quantity, 0)
  );
  
  cartTotal = computed(() =>
    this.cart().reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  cartIgv = computed(() => this.cartTotal() * 0.18);
  
  cartTotalWithIgv = computed(() => this.cartTotal() + this.cartIgv());

  getAggregatedItems = computed(() => {
    const items = this.cart();
    const map = new Map<number, CartItem>();
    for (const it of items) {
      const existing = map.get(it.id);
      if (existing) {
        existing.quantity += it.quantity;
      } else {
        map.set(it.id, { ...it });
      }
    }
    return Array.from(map.values());
  });

  constructor() {
    this.loadFromStorage();
    
    
    this.loadCartFromServer();

    
    effect(() => {
      if (!this.authService.isAuthenticatedUser()) {
        this.cart.set([]);
        localStorage.removeItem('inkapt-cart');
      }
    });
  }

  private getHeaders() {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  syncCartOnLogin() {
    this.loadCartFromServer();
  }

  loadCartFromServer() {
    if (this.authService.isAuthenticatedUser()) {
      this.http.get<any>(this.API_URL, { headers: this.getHeaders() }).subscribe({
        next: (res) => {
          if (res.success && Array.isArray(res.data)) {
            const items: CartItem[] = res.data.map((item: any) => ({
              id: item.id_producto,
              name: item.nombre || 'Producto',
              price: parseFloat(item.precio_fijo || item.precio || 0),
              quantity: item.cantidad,
              image: item.imagen_url || 'assets/pure-inka-logo.png'
            }));
            this.cart.set(items);
            this.saveToStorage();
          }
        }
      });
    }
  }

  getCartItems = () => this.cart();

  addToCart(product: Product): void {
    const current = this.cart();
    const existingIndex = current.findIndex(item => item.id === product.id);
    const newQuantity = (existingIndex > -1) ? current[existingIndex].quantity + 1 : 1;

    if (this.authService.isAuthenticatedUser()) {
      this.http.post(this.API_URL, { id_producto: product.id, cantidad: newQuantity }, { headers: this.getHeaders() }).subscribe(() => {
        this.loadCartFromServer();
      });
    } else {
      if (existingIndex > -1) {
        const updated = [...current];
        updated[existingIndex] = { ...updated[existingIndex], quantity: newQuantity };
        this.cart.set(updated);
      } else {
        this.cart.set([...current, { ...product, quantity: 1 }]);
      }
      this.saveToStorage();
    }
  }

  removeFromCart(productId: number): void {
    if (this.authService.isAuthenticatedUser()) {
      this.http.delete(`${this.API_URL}/${productId}`, { headers: this.getHeaders() }).subscribe(() => {
        this.loadCartFromServer();
      });
    } else {
      this.cart.set(this.cart().filter(item => item.id !== productId));
      this.saveToStorage();
    }
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    if (this.authService.isAuthenticatedUser()) {
      this.http.post(this.API_URL, { id_producto: productId, cantidad: quantity }, { headers: this.getHeaders() }).subscribe(() => {
        this.loadCartFromServer();
      });
    } else {
      this.cart.set(this.cart().map(item =>
        item.id === productId ? { ...item, quantity } : item
      ));
      this.saveToStorage();
    }
  }

  clearCart(): void {
    if (this.authService.isAuthenticatedUser()) {
      this.http.delete(this.API_URL, { headers: this.getHeaders() }).subscribe(() => {
        this.cart.set([]);
        this.saveToStorage();
      });
    } else {
      this.cart.set([]);
      this.saveToStorage();
    }
  }

  private saveToStorage(): void {
    localStorage.setItem('inkapt-cart', JSON.stringify(this.cart()));
  }

  private loadFromStorage(): void {
    const saved = localStorage.getItem('inkapt-cart');
    if (saved) {
      try {
        this.cart.set(JSON.parse(saved));
      } catch {
        localStorage.removeItem('inkapt-cart');
      }
    }
  }
}

