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
  styleUrl: './checkout.scss'
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
  selectedFile: File | null = null;

  receiptType = signal<'BOLETA' | 'FACTURA'>('BOLETA');
  invoiceData = {
    ruc: '',
    razon_social: ''
  };

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

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
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
    } catch (err) {}
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
    const selected = this.direcciones().find(d => d.id_direccion === id);
    if (selected) {
      
      const cost = selected.id_pais === 1 ? 10.00 : 50.00;
      this.selectedShipping.set(cost);
    }
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
        this.checkoutError.set(err.error?.message || 'Error al guardar dirección');
        this.isProcessing.set(false);
      }
    });
  }

  nextStep() {
    if (this.currentStep() === 1 && !this.selectedAddressId()) {
      this.checkoutError.set('Selecciona una dirección');
      return;
    }
    this.checkoutError.set(null);
    this.currentStep.set(2);

    if (this.currentStep() === 2 && this.paymentMethod() === 'stripe') {
      this.mountStripe();
    }
  }

  prevStep() {
    this.currentStep.update(s => s - 1);
  }

  changePaymentMethod(method: 'yape' | 'plin' | 'transferencia' | 'stripe') {
    this.paymentMethod.set(method);
    this.selectedFile = null;
    if (method === 'stripe') {
      this.mountStripe();
    }
  }

  async placeOrder() {
    if (this.paymentMethod() === 'stripe') {
      this.processStripePayment();
      return;
    }

    if (!this.selectedFile) {
      this.checkoutError.set('Por favor, sube una captura del comprobante de pago.');
      return;
    }

    this.isProcessing.set(true);
    
    const formData = new FormData();
    formData.append('id_direccion', this.selectedAddressId()?.toString() || '');
    formData.append('total', this.total().toString());
    formData.append('metodo_pago', this.paymentMethod());
    formData.append('transaccion_id', 'TRX-' + Date.now());
    formData.append('tipo_comprobante', this.receiptType());
    if (this.receiptType() === 'FACTURA') {
      formData.append('ruc', this.invoiceData.ruc);
      formData.append('razon_social', this.invoiceData.razon_social);
    }
    formData.append('orderItems', JSON.stringify(this.cartItems().map(item => ({
      id_producto: item.id,
      cantidad: item.quantity,
      precio_fijo: item.price
    }))));
    formData.append('voucher', this.selectedFile);

    this.orderService.createOrder(formData).subscribe({
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
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.authService.getToken()}`,
        'Content-Type': 'application/json'
      });

      const paymentIntentRes: any = await firstValueFrom(
        this.http.post(`${environment.apiUrl}/orders/create-payment-intent`, {
          total: this.total()
        }, { headers })
      );

      const clientSecret = paymentIntentRes.clientSecret;

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
        const orderData = {
          id_direccion: this.selectedAddressId(),
          total: this.total(),
          metodo_pago: 'card',
          estado_pago: 'RECHAZADO',
          transaccion_id: result.error.payment_intent?.id || 'FALLIDO',
          tipo_comprobante: this.receiptType(),
          ruc: this.receiptType() === 'FACTURA' ? this.invoiceData.ruc : null,
          razon_social: this.receiptType() === 'FACTURA' ? this.invoiceData.razon_social : null,
          orderItems: this.cartItems().map(item => ({
            id_producto: item.id,
            cantidad: item.quantity,
            precio_fijo: item.price
          }))
        };
        this.orderService.createOrder(orderData).subscribe(); 

        this.checkoutError.set(result.error.message || 'Error en el pago con Stripe');
        this.isProcessing.set(false);
      } else if (result.paymentIntent?.status === 'succeeded') {
        const orderData = {
          id_direccion: this.selectedAddressId(),
          total: this.total(),
          metodo_pago: 'card',
          estado_pago: 'PAGADO',
          transaccion_id: result.paymentIntent.id,
          tipo_comprobante: this.receiptType(),
          ruc: this.receiptType() === 'FACTURA' ? this.invoiceData.ruc : null,
          razon_social: this.receiptType() === 'FACTURA' ? this.invoiceData.razon_social : null,
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
