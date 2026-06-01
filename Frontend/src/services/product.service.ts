import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Product,
  ApiProduct,
  ApiCategory,
  ProductsApiResponse,
  CategoriesApiResponse,
  ProductApiResponse
} from '../models/api.models';
import { catchError, of, firstValueFrom, Observable, map } from 'rxjs';
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

  private pagination = signal<{ total: number, page: number, limit: number, pages: number } | null>(null);

  async loadProducts(search?: string, category?: string, page: number = 1, limit: number = 9): Promise<void> {
    this.loadingProducts.set(true);
    this.errorProducts.set(null);
    try {
      let url = `${this.API_PRODUCTS_URL}?page=${page}&limit=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (category) url += `&category=${category}`;

      const response = await firstValueFrom(this.http.get<ProductsApiResponse>(url));
      if (response.success && Array.isArray(response.data)) {
        this.products.set(response.data.map(p => this.mapApiProductToProduct(p)));
        this.pagination.set(response.pagination || null);
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

  getSuggestedProducts(productId: string | number): Observable<Product[]> {
    return this.http.get<any>(`${this.API_PRODUCTS_URL}/${productId}/suggested`).pipe(
      map(res => res.success ? res.data.map((p: any) => this.mapApiProductToProduct(p)) : []),
      catchError(() => of([]))
    );
  }

  getPagination = () => this.pagination();

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

  getProductById(id: string | number): Observable<ProductApiResponse> {
    return this.http.get<ProductApiResponse>(`${this.API_PRODUCTS_URL}/${id}`).pipe(
      catchError(() => of({ success: false, data: {} as ApiProduct }))
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
      stock_actual: apiProduct.stock_actual,
      isActive: apiProduct.activo,
      id_categoria: apiProduct.id_categoria,
      category_name: apiProduct.category_name,
      isNew: false,
      rating: 0
    };
  }

  private buildImageUrl(imagePath: string | undefined): string {
    if (!imagePath) return 'assets/pure-inka-logo.png';
    
    // Si ya es una URL completa (Cloudinary), devolverla tal cual
    if (imagePath.startsWith('http')) return imagePath;
    
    // Si es una imagen local (por ejemplo, de la base de datos local anterior)
    if (imagePath === 'pure-inka-logo.png') return 'assets/pure-inka-logo.png';
    
    // Caso por defecto para desarrollo local con archivos estáticos
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
