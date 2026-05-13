import { Injectable, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../environments/environment';
import { AuthService } from './auth/auth.service';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  private authService = inject(AuthService);
  private messageSubject = new Subject<any>();
  private notificationSubject = new Subject<any>();

  constructor() {
    this.connect();
  }

  connect() {
    const token = this.authService.getToken();
    if (!token) return;

    if (this.socket?.connected) return;

    // Singleton instance initialization
    // Forzamos el puerto 5000 que es donde suele estar el backend en desarrollo
    const socketUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:5000' 
      : environment.apiUrl.replace('/api', '');

    this.socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket']
    });

    // Listeners según especificación
    this.socket.on('receive_message', (message: any) => {
      this.messageSubject.next(message);
    });

    this.socket.on('new_client_message', (data: any) => {
      this.notificationSubject.next(data);
    });

    this.socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });
  }

  onMessage(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  onNotification(): Observable<any> {
    return this.notificationSubject.asObservable();
  }

  // EMIT: Unirse a la sala (Punto 2.1)
  joinRoom(conversationId: number | null) {
    if (conversationId) {
      this.socket?.emit('join_room', conversationId);
    }
  }

  // EMIT: Enviar mensaje vía Socket (Punto 2.2)
  sendSocketMessage(payload: { id_conversacion: number | null, contenido: string }) {
    this.socket?.emit('send_message', { 
      ...payload, 
      tipo_mensaje: 'TEXTO' 
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
