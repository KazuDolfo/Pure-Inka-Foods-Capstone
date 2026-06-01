import { TestBed, ComponentFixture, fakeAsync, tick, flush } from '@angular/core/testing';
import { Shop } from '../../app/pages/shop/shop';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { provideRouter } from '@angular/router';

describe('Shop Component', () => {
  let component: Shop;
  let fixture: ComponentFixture<Shop>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Shop],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        ProductService,
        CartService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Shop);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should debounce search input', fakeAsync(() => {
    fixture.detectChanges(); 
    tick(); 
    
    const event = { target: { value: 'Maca' } } as any;
    component.onSearchInput(event);
    
    expect(component.searchTerm).toBe(''); 
    
    tick(500); 
    fixture.detectChanges();
    
    expect(component.searchTerm).toBe('Maca');
  }));
});

