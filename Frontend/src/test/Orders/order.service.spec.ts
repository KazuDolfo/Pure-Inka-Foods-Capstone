import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth/auth.service';
import { environment } from '../../environments/environment';

describe('OrderService', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    const authServiceMock = {
      getToken: () => 'mock-token'
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        OrderService,
        { provide: AuthService, useValue: authServiceMock }
      ]
    });
    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should call createOrder with FormData correctly', () => {
    const formData = new FormData();
    formData.append('total', '100');

    service.createOrder(formData).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/orders`);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
    // Content-Type should not be set manually for FormData to let the browser set boundary
    expect(req.request.headers.get('Content-Type')).toBeNull();
  });
});
