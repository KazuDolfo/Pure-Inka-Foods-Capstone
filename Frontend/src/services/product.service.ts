// src/services/product.service.ts
import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Product,
  ApiProduct,
  ApiCategory,
  ProductsApiResponse,
  CategoriesApiResponse
} from '../models';
import { catchError, of, firstValueFrom, Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private products = signal<Product[]>([]);
  private categories = signal<ApiCategory[]>([]);
  private loadingProducts = signal(false);
  private loadingCategories = signal(false);
  private errorProducts = signal<string | null>(null);
  private errorCategories = signal<string | null>(null);

  private API_PRODUCTS_URL = `${environment.apiUrl}/products`;
  private API_CATEGORIES_URL = `${environment.apiUrl}/categories`; 

  async loadProducts(): Promise<void> {
    this.loadingProducts.set(true);
    this.errorProducts.set(null);
    try {
      const response = await firstValueFrom(this.http.get<ProductsApiResponse>(this.API_PRODUCTS_URL));
      if (response.success && Array.isArray(response.data)) {
        this.products.set(response.data.map(p => this.mapApiProductToProduct(p)));
      } else {
        this.errorProducts.set('Error al cargar productos');
      }
    } catch (err: any) {
      this.errorProducts.set(err.message || 'Error al cargar productos');
      this.products.set([]);
    } finally {
      this.loadingProducts.set(false);
    }
  }

  async loadCategories(): Promise<void> {
    this.loadingCategories.set(true);
    this.errorCategories.set(null);
    try {
      const response = await firstValueFrom(this.http.get<CategoriesApiResponse>(this.API_CATEGORIES_URL));
      if (response.success) {
        this.categories.set(response.data);
      } else {
        this.errorCategories.set('Error al cargar categorías');
      }
    } catch (err: any) {
      this.errorCategories.set(err.message || 'Error al cargar categorías');
      this.categories.set([]);
    } finally {
      this.loadingCategories.set(false);
    }
  }

  getProductById(id: string | number): Observable<any> {
    return this.http.get<any>(`${this.API_PRODUCTS_URL}/${id}`).pipe(
      catchError(() => of({ success: false, data: null }))
    );
  }

  private mapApiProductToProduct(apiProduct: ApiProduct): Product {
    return {
      id: apiProduct.id_producto,
      sku: apiProduct.sku,
      name: apiProduct.nombre,
      price: typeof apiProduct.precio === 'string' ? parseFloat(apiProduct.precio) : apiProduct.precio,
      description: apiProduct.descripcion || '',
      image: this.buildImageUrl(apiProduct.imagen_url),
      stock: apiProduct.stock_actual,
      isActive: apiProduct.activo,
      id_categoria: apiProduct.id_categoria,
      isNew: false,
      rating: 0
    };
  }

  private buildImageUrl(imagePath: string | undefined): string {
    if (!imagePath) return 'assets/pure-inka-logo.png';
    if (imagePath.startsWith('http')) return imagePath;
    
    // Según especificación: /public/uploads/products/
    const baseUrl = environment.apiUrl.replace('/api', '');
    return `${baseUrl}/public/uploads/products/${imagePath}`;
  }

  getProducts = () => this.products();
  getCategories = () => this.categories();
  isLoadingProducts = () => this.loadingProducts();
  isLoadingCategories = () => this.loadingCategories();
  getErrorProducts = () => this.errorProducts();
  getErrorCategories = () => this.errorCategories();
}
