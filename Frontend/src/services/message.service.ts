import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from './auth/auth.service';
import { environment } from '../environments/environment';
import { Mensaje, Conversacion } from '../models';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private API_URL = `${environment.apiUrl}/messages`;

  private getHeaders() {
    const token = this.auth.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // --- CLIENTE: Obtener su Chat (Punto 1.A) ---
  getMyConversation(): Observable<{ conversation: Conversacion, messages: Mensaje[] }> {
    return this.http.get<any>(`${this.API_URL}/my-conversation`, { headers: this.getHeaders() }).pipe(
      map(res => {
        const data = res.data || {};
        return {
          conversation: data,
          messages: data.messages || []
        };
      })
    );
  }

  // --- ADMIN: Bandeja de Entrada (Punto 1.B) ---
  getAdminConversations(): Observable<Conversacion[]> {
    return this.http.get<any>(`${this.API_URL}/admin/conversations`, { headers: this.getHeaders() }).pipe(
      map(res => res.success ? res.data : [])
    );
  }

  // --- ADMIN: Ver Detalle (Punto 1.C) ---
  getAdminConversationById(id: number): Observable<{ conversation: Conversacion, messages: Mensaje[] }> {
    return this.http.get<any>(`${this.API_URL}/admin/conversations/${id}`, { headers: this.getHeaders() }).pipe(
      map(res => {
        const data = res.data || {};
        // Dependiendo de si el backend devuelve el objeto completo o solo el array
        if (Array.isArray(data)) return { conversation: {} as Conversacion, messages: data };
        return {
          conversation: data.conversation || data,
          messages: data.messages || data.mensajes || []
        };
      })
    );
  }

  // --- UNIVERSAL: Enviar Mensaje (Punto 1.4) ---
  sendMessage(payload: { contenido: string, id_conversacion?: number | null, id_receptor?: number, image?: File }): Observable<any> {
    const headers = this.getHeaders();
    
    if (payload.image) {
      const formData = new FormData();
      formData.append('contenido', payload.contenido);
      if (payload.id_conversacion) formData.append('id_conversacion', payload.id_conversacion.toString());
      if (payload.id_receptor) formData.append('id_receptor', payload.id_receptor.toString());
      formData.append('image', payload.image);
      return this.http.post(this.API_URL, formData, { headers });
    } else {
      return this.http.post(this.API_URL, payload, { headers: headers.set('Content-Type', 'application/json') });
    }
  }

  markAsRead(id_conversacion: number): Observable<any> {
    return this.http.put(`${this.API_URL}/read/${id_conversacion}`, {}, { headers: this.getHeaders() });
  }
}
