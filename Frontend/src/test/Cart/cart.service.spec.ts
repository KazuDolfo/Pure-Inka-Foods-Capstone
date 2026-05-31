import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth/auth.service';

describe('CartService', () => {
  let service: CartService;

  beforeEach(() => {
    const authServiceMock = {
      isAuthenticatedUser: () => false,
      getToken: () => 'mock-token'
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CartService,
        { provide: AuthService, useValue: authServiceMock }
      ]
    });
    service = TestBed.inject(CartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should calculate cart total and IGV 18% correctly', () => {
    const product1 = { id: 1, name: 'Maca', price: 100, image: '', category: '' };
    const product2 = { id: 2, name: 'Quinua', price: 50, image: '', category: '' };

    service.addToCart(product1 as any);
    service.addToCart(product2 as any);

    expect(service.cartTotal()).toBe(150);
    expect(service.cartIgv()).toBe(150 * 0.18); // 27
    expect(service.cartTotalWithIgv()).toBe(177);
  });
});
