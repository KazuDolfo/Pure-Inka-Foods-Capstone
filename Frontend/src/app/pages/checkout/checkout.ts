import { Component, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';
import { CartService } from '../../../services/cart.service';
import { CartItem, Direccion, Pais } from '../../../models';
import { OrderService } from '../../../services/order.service';
import { UserDataService } from '../../../services/user-data.service';
import { environment } from '../../../environments/environment';

import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  currentStep = signal<number>(1);
  cartItems = signal<CartItem[]>([]);
  direcciones = signal<Direccion[]>([]);
  paises = signal<Pais[]>([]);
  selectedAddressId = signal<number | null>(null);
  showAddressForm = signal(false);
  
  addressForm = {
    id_pais: 1,
    nombre_direccion: 'Mi Hogar',
    estado_region: '',
    ciudad: '',
    codigo_postal: '',
    direccion_exacta: '',
    referencia: ''
  };

  isLoading = signal(false);
  isProcessing = signal(false);
  checkoutError = signal<string | null>(null);
  orderPlaced = signal(false);
  selectedShipping = signal<number>(10.00);
  paymentMethod = signal<'yape' | 'plin' | 'transferencia' | 'stripe'>('yape');

  // Stripe
  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  cardElement: StripeCardElement | null = null;

  subtotal = computed(() =>
    this.cartItems().reduce((acc, item) => acc + item.price * item.quantity, 0)
  );
  total = computed(() => this.subtotal() + this.selectedShipping());

  constructor(
    private router: Router,
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private userDataService: UserDataService,
    private http: HttpClient
  ) {}

  async ngOnInit(): Promise<void> {
    this.cartItems.set(this.cartService.getCartItems());
    if (this.cartItems().length === 0) {
      this.router.navigate(['/shop']);
      return;
    }
    this.loadAddresses();
    this.loadCountries();
    this.initStripe();
  }

  async initStripe() {
    try {
      this.stripe = await loadStripe(environment.stripePublicKey);
      if (this.stripe) {
        this.elements = this.stripe.elements();
        this.cardElement = this.elements.create('card', {
          style: {
            base: {
              fontSize: '16px',
              color: '#32325d',
              '::placeholder': { color: '#aab7c4' },
            },
            invalid: { color: '#fa755a', iconColor: '#fa755a' },
          },
        });
      }
    } catch (err) {
      console.error('Error al inicializar Stripe:', err);
    }
  }

  mountStripe() {
    setTimeout(() => {
      const el = document.getElementById('card-element');
      if (this.cardElement && el) {
        this.cardElement.mount('#card-element');
      }
    }, 100);
  }

  async loadAddresses() {
    this.isLoading.set(true);
    this.userDataService.getAddresses().subscribe({
      next: (res: any) => {
        this.direcciones.set(res);
        if (res.length > 0) this.selectedAddressId.set(res[0].id_direccion);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  async loadCountries() {
    this.userDataService.getCountries().subscribe((res: Pais[]) => this.paises.set(res));
  }

  selectAddress(id: number) {
    this.selectedAddressId.set(id);
  }

  async addAddress(form: NgForm) {
    if (form.invalid) return;
    this.isProcessing.set(true);
    this.userDataService.addAddress(this.addressForm).subscribe({
      next: (res: any) => {
        this.loadAddresses();
        this.showAddressForm.set(false);
        this.isProcessing.set(false);
      },
      error: (err: any) => {
        this.checkoutError.set(err.error?.message || 'Error al guardar direcciÃ³n');
        this.isProcessing.set(false);
      }
    });
  }

  nextStep() {
    if (this.currentStep() === 1 && !this.selectedAddressId()) {
      this.checkoutError.set('Selecciona una direcciÃ³n');
      return;
    }
    this.checkoutError.set(null);
    this.currentStep.update(s => s + 1);

    if (this.currentStep() === 3 && this.paymentMethod() === 'stripe') {
      this.mountStripe();
    }
  }

  prevStep() {
    this.currentStep.update(s => s - 1);
  }

  changePaymentMethod(method: 'yape' | 'plin' | 'transferencia' | 'stripe') {
    this.paymentMethod.set(method);
    if (method === 'stripe') {
      this.mountStripe();
    }
  }

  async placeOrder() {
    if (this.paymentMethod() === 'stripe') {
      this.processStripePayment();
      return;
    }

    this.isProcessing.set(true);
    const orderData = {
      id_direccion: this.selectedAddressId(),
      total: this.total(),
      metodo_pago: this.paymentMethod(),
      transaccion_id: 'TRX-' + Date.now(),
      orderItems: this.cartItems().map(item => ({
        id_producto: item.id,
        cantidad: item.quantity,
        precio_fijo: item.price
      }))
    };

    this.orderService.createOrder(orderData).subscribe({
      next: () => this.finishOrder(),
      error: (err: any) => {
        this.checkoutError.set(err.message || 'Error al crear el pedido');
        this.isProcessing.set(false);
      }
    });
  }

  async processStripePayment() {
    this.isProcessing.set(true);
    this.checkoutError.set(null);

    try {
      // 1. Crear el PaymentIntent en el backend
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.authService.getToken()}`,
        'Content-Type': 'application/json'
      });

      const paymentIntentRes: any = await firstValueFrom(
        this.http.post(`${environment.apiUrl}/orders/create-payment-intent`, {
          total: this.total() // Enviamos el total en Soles (ej: 45.50)
        }, { headers })
      );

      const clientSecret = paymentIntentRes.clientSecret;

      // 2. Confirmar el pago con Stripe
      if (!this.stripe || !this.cardElement) {
        throw new Error('Stripe no se ha inicializado correctamente.');
      }

      const result = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: this.cardElement,
          billing_details: {
            name: this.authService.getCurrentUser()?.nombre || 'Cliente'
          },
        }
      });

      if (result.error) {
        // REGISTRO DE PAGO RECHAZADO
        const orderData = {
          id_direccion: this.selectedAddressId(),
          total: this.total(),
          metodo_pago: 'card',
          estado_pago: 'RECHAZADO', // Indicamos que falló el pago
          transaccion_id: result.error.payment_intent?.id || 'FALLIDO',
          orderItems: this.cartItems().map(item => ({
            id_producto: item.id,
            cantidad: item.quantity,
            precio_fijo: item.price
          }))
        };
        // Opcional: Podrías querer guardar el pedido rechazado o solo mostrar el error
        this.orderService.createOrder(orderData).subscribe(); 

        this.checkoutError.set(result.error.message || 'Error en el pago con Stripe');
        this.isProcessing.set(false);
      } else if (result.paymentIntent?.status === 'succeeded') {
        // REGISTRO DE PAGO EXITOSO
        const orderData = {
          id_direccion: this.selectedAddressId(),
          total: this.total(),
          metodo_pago: 'card',
          estado_pago: 'PAGADO', // Sincronizamos con tu lógica de BD
          transaccion_id: result.paymentIntent.id,
          orderItems: this.cartItems().map(item => ({
            id_producto: item.id,
            cantidad: item.quantity,
            precio_fijo: item.price
          }))
        };

        this.orderService.createOrder(orderData).subscribe({
          next: () => this.finishOrder(),
          error: (err: any) => {
            this.checkoutError.set('Pago exitoso pero error al registrar pedido. Contacte soporte.');
            this.isProcessing.set(false);
          }
        });
      }
    } catch (err: any) {
      this.checkoutError.set(err.error?.message || err.message || 'Error al procesar Stripe');
      this.isProcessing.set(false);
    }
  }

  finishOrder() {
    this.orderPlaced.set(true);
    this.cartService.clearCart();
    this.isProcessing.set(false);
    setTimeout(() => this.router.navigate(['/user-profile']), 3000);
  }
}
