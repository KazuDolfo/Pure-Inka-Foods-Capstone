// src/services/user-data.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from './auth/auth.service';
import { Pedido, Devolucion, Mensaje, Direccion, Pais } from '../models';
import { environment } from '../environments/environment';

const API_BASE_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class UserDataService {

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token || ''}`,
      'Content-Type': 'application/json'
    });
  }

  getCountries(): Observable<Pais[]> {
    return this.http.get<any>(`${API_BASE_URL}/addresses/countries`).pipe(
      map(res => res.success ? res.data : []),
      catchError(() => of([]))
    );
  }

  getAddresses(): Observable<Direccion[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${API_BASE_URL}/addresses`, { headers }).pipe(
      map(res => res.success ? res.data : []),
      catchError(() => of([]))
    );
  }

  addAddress(address: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${API_BASE_URL}/addresses`, address, { headers });
  }

  getMessages(): Observable<Mensaje[]> {
    return of([]); 
  }

  getPendingRefunds(): Observable<Devolucion[]> {
    return of([]);
  }

  updateProfile(userData: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put<any>(`${API_BASE_URL}/users/profile`, userData, { headers });
  }

  updatePassword(passwordData: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put<any>(`${API_BASE_URL}/users/password`, passwordData, { headers });
  }
}
