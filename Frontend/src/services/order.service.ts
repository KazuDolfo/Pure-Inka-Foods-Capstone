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

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.auth.getToken() || ''}`,
      'Content-Type': 'application/json'
    });
  }

  // POST / (Crea pedido y descuenta stock)
  createOrder(orderData: any): Observable<any> {
    return this.http.post<any>(this.API_URL, orderData, { headers: this.getHeaders() }).pipe(
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
}
