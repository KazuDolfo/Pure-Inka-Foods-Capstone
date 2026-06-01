import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from '../../services/product.service';
import { environment } from '../../environments/environment';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService]
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch and map products correctly', fakeAsync(() => {
    const mockApiResponse = {
      success: true,
      data: [
        {
          id_producto: 1,
          nombre: 'Maca Powder',
          precio: '38.00',
          stock_actual: 50,
          imagen_url: 'maca.png',
          activo: 1,
          category_name: 'Superfoods'
        }
      ]
    };

    service.loadProducts();

    const req = httpMock.expectOne(`${environment.apiUrl}/products`);
    expect(req.request.method).toBe('GET');
    req.flush(mockApiResponse);

    tick(); 

    const products = service.getProducts();
    expect(products.length).toBe(1);
    expect(products[0].name).toBe('Maca Powder');
    expect(products[0].price).toBe(38.0);
    expect(products[0].category_name).toBe('Superfoods');
  }));
});


