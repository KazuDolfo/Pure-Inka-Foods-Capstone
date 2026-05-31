import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from './auth/auth.service';
import { environment } from '../environments/environment';
import { Pedido } from '../models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private API_URL = `${environment.apiUrl}/orders`;

  private getHeaders(isFormData: boolean = false): HttpHeaders {
    let headers = new HttpHeaders({
      'Authorization': `Bearer ${this.auth.getToken() || ''}`
    });
    
    if (!isFormData) {
      headers = headers.set('Content-Type', 'application/json');
    }
    
    return headers;
  }

  // POST / (Crea pedido y descuenta stock)
  createOrder(orderData: any): Observable<any> {
    const isFormData = orderData instanceof FormData;
    return this.http.post<any>(this.API_URL, orderData, { headers: this.getHeaders(isFormData) }).pipe(
      catchError(err => throwError(() => new Error(err.error?.message || 'Error al crear pedido')))
    );
  }

  // GET /myorders (Historial del usuario)
  getMyOrders(): Observable<Pedido[]> {
    return this.http.get<any>(`${this.API_URL}/myorders`, { headers: this.getHeaders() }).pipe(
      map(res => res.success ? res.data : []),
      catchError(() => throwError(() => new Error('Error al obtener tus pedidos')))
    );
  }

  // GET /admin (Todas las órdenes)
  getAdminOrders(): Observable<Pedido[]> {
    return this.http.get<any>(`${this.API_URL}/admin`, { headers: this.getHeaders() }).pipe(
      map(res => res.success ? res.data : []),
      catchError(() => throwError(() => new Error('Error al obtener pedidos de administración')))
    );
  }

  // GET /:id (Detalles de una orden)
  getOrderDetails(id: number): Observable<Pedido> {
    return this.http.get<any>(`${this.API_URL}/${id}`, { headers: this.getHeaders() }).pipe(
      map(res => res.success ? res.data : null),
      catchError(() => throwError(() => new Error('Error al obtener detalles del pedido')))
    );
  }

  // PUT /:id/status (Admin)
  updateOrderStatus(id: number, statusData: { estado_pago?: string, estado_envio?: string }): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/${id}/status`, statusData, { headers: this.getHeaders() }).pipe(
      catchError(err => throwError(() => new Error(err.error?.message || 'Error al actualizar pedido')))
    );
  }

  // Descargar PDF de Comprobante
  downloadPDF(id: number): Observable<Blob> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.auth.getToken() || ''}`
    });
    return this.http.get(`${this.API_URL}/${id}/pdf`, { 
      headers, 
      responseType: 'blob' 
    });
  }
}
