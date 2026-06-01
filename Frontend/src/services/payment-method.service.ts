import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { AuthService } from './auth/auth.service';

export interface PaymentMethod {
    id_metodo: number;
    nombre: string;
    imagen_qr: string;
    activo: boolean;
    instrucciones: string;
}

@Injectable({
    providedIn: 'root'
})
export class PaymentMethodService {
    private apiUrl = `${environment.apiUrl}/payment-methods`;

    constructor(private http: HttpClient, private auth: AuthService) { }

    private authHeaders() {
        const token = this.auth.getToken();
        return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    }

    getActiveMethods(): Observable<PaymentMethod[]> {
        return this.http.get<PaymentMethod[]>(`${this.apiUrl}/active`, { headers: this.authHeaders() });
    }

    getAllMethods(): Observable<PaymentMethod[]> {
        return this.http.get<PaymentMethod[]>(this.apiUrl, { headers: this.authHeaders() });
    }

    updateMethod(id: number, data: FormData): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, data, { headers: this.authHeaders() });
    }
}
