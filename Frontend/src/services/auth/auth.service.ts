import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Usuario } from '../../models/usuario.model'; 
import { environment } from '../../environments/environment';
import { 
  AuthApiResponse, 
  AuthResponseData, 
  UserProfileApiResponse, 
  UserProfileResponseData,
  ApiResponse
} from '../../models/api.models';

const API_URL = environment.apiUrl;
const USERS_API_URL = `${API_URL}/users`;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser = signal<Usuario | null>(null);
  private token = signal<string | null>(null);
  readonly isAuthenticated = signal(false);
  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) {
    this.loadAuthFromStorage();

    effect(() => {
      const token = this.token();
      this.isAuthenticated.set(!!token);
      if (!token) this.currentUser.set(null);
    });

    if (this.token()) this.validateToken();
  }

  login(credentials: LoginRequest, isAdmin: boolean = false): Observable<AuthApiResponse> {
    const endpoint = isAdmin ? `${USERS_API_URL}/admin-login` : `${USERS_API_URL}/login`;
    return this.http.post<AuthApiResponse>(endpoint, credentials).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.handleAuthResponse(response.data);
        }
      }),
      catchError(err => throwError(() => err))
    );
  }

  register(userData: RegisterRequest): Observable<AuthApiResponse> {
    return this.http.post<AuthApiResponse>(USERS_API_URL, userData).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.handleAuthResponse(response.data);
        }
      }),
      catchError(err => throwError(() => err))
    );
  }

  logout(): void {
    this.token.set(null);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  getToken(): string | null {
    return this.token();
  }

  getCurrentUser(): Usuario | null {
    return this.currentUser();
  }

  isAuthenticatedUser(): boolean {
    return this.isAuthenticated();
  }

  private handleAuthResponse(data: AuthResponseData): void {
    if (data?.token) {
      this.token.set(data.token);
      const user: Usuario = {
        id_usuario: data.id_usuario,
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono,
        rol: data.rol.toLowerCase() === 'admin' || data.rol.toLowerCase() === 'administrador' ? 'administrador' : 'cliente',
        fecha_registro: data.fecha_registro || ''
      };
      this.currentUser.set(user);
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(user));
      }
    }
  }

  private loadAuthFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      if (token) this.token.set(token);
      if (user) {
        try {
          this.currentUser.set(JSON.parse(user) as Usuario);
        } catch {
          this.logout();
        }
      }
    }
  }

  private validateToken(): void {
    const token = this.token();
    if (!token) return;
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<UserProfileApiResponse>(`${USERS_API_URL}/profile`, { headers }).pipe(
      tap(response => {
        if (response.success && response.data) {
          const apiUser = response.data;
          const user: Usuario = {
            id_usuario: apiUser.id_usuario,
            nombre: apiUser.nombre,
            email: apiUser.email,
            telefono: apiUser.telefono,
            rol: apiUser.rol.toLowerCase() === 'admin' || apiUser.rol.toLowerCase() === 'administrador' ? 'administrador' : 'cliente',
            fecha_registro: apiUser.fecha_registro || ''
          };
          this.currentUser.set(user);
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('user', JSON.stringify(user));
          }
        } else {
          this.logout();
        }
      }),
      catchError(() => {
        this.logout();
        return of(null);
      })
    ).subscribe();
  }

  isAdmin(): boolean {
    const user = this.currentUser();
    return user?.rol === 'administrador' || user?.rol.toUpperCase() === 'ADMIN';
  }

  forgotPassword(identifier: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${USERS_API_URL}/forgot-password`, { identifier });
  }

  verifyCode(identifier: string, code: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${USERS_API_URL}/verify-code`, { identifier, code });
  }

  resetPassword(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${USERS_API_URL}/reset-password`, data);
  }

  updateUser(userData: UserProfileResponseData): void {
    const user: Usuario = {
      id_usuario: userData.id_usuario,
      nombre: userData.nombre,
      email: userData.email,
      rol: userData.rol.toLowerCase() === 'admin' || userData.rol.toLowerCase() === 'administrador' ? 'administrador' : 'cliente',
      telefono: userData.telefono,
      fecha_registro: userData.fecha_registro || this.currentUser()?.fecha_registro || ''
    };
    this.currentUser.set(user);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }
}
