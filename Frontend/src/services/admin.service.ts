import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth/auth.service';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private API_BASE_URL = environment.apiUrl;

  private getAuthHeaders(isFormData = false): HttpHeaders {
    const token = this.auth.getToken();
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    
    // IMPORTANTE: Si es FormData, NO seteamos Content-Type. 
    // El navegador lo hace solo para incluir el 'boundary'.
    if (!isFormData) {
      headers = headers.set('Content-Type', 'application/json');
    }
    return headers;
  }

  // CATEGORÍAS
  getCategories(): Observable<any[]> {
    return this.http.get<any>(`${this.API_BASE_URL}/categories`).pipe(
      map(res => res.success ? res.data : []),
      catchError(err => throwError(() => new Error(err.error?.message || 'Fallo al obtener categorías')))
    );
  }

  addCategory(categoryData: { nombre: string }): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/categories`, categoryData, { headers: this.getAuthHeaders() });
  }

  // PRODUCTOS
  addProduct(productData: FormData): Observable<any> {
    // Pasamos true para indicar que es FormData
    return this.http.post(`${this.API_BASE_URL}/products`, productData, { headers: this.getAuthHeaders(true) });
  }

  updateProduct(id: number, productData: FormData): Observable<any> {
    return this.http.put(`${this.API_BASE_URL}/products/${id}`, productData, { headers: this.getAuthHeaders(true) });
  }

  updateStock(productId: number, data: { cantidad: number, tipo: 'ENTRADA' | 'SALIDA', motivo: string }): Observable<any> {
    return this.http.put(`${this.API_BASE_URL}/products/${productId}/stock`, data, { headers: this.getAuthHeaders() });
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.API_BASE_URL}/products/${id}`, { headers: this.getAuthHeaders() });
  }

  // USUARIOS
  getUserProfile(id: number): Observable<any> {
    return this.http.get<any>(`${this.API_BASE_URL}/users/profile/${id}`, { headers: this.getAuthHeaders() }).pipe(
      map(res => res.success ? res.data : null),
      catchError(() => throwError(() => new Error('Error al obtener perfil de usuario')))
    );
  }

  getUserOrders(id: number): Observable<any[]> {
    return this.http.get<any>(`${this.API_BASE_URL}/orders/user/${id}`, { headers: this.getAuthHeaders() }).pipe(
      map(res => res.success ? res.data : []),
      catchError(() => throwError(() => new Error('Error al obtener pedidos del usuario')))
    );
  }

  // DASHBOARD
  getDashboardStats(range: string = '30d'): Observable<any> {
    return this.http.get<any>(`${this.API_BASE_URL}/admin/stats?range=${range}`, { headers: this.getAuthHeaders() }).pipe(
      map(res => res.success ? res.data : null),
      catchError(() => throwError(() => new Error('Error al obtener estadísticas')))
    );
  }
}
