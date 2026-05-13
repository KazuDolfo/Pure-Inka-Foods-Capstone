import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms'; 
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';
import { Usuario } from '../../../models/usuario.model'; 
import { PageHeader } from '../../components/page-header/page-header';
import { InfoCard } from '../../components/info-card/info-card';

// Payload que se envía al backend
interface MessagePayload {
  id_usuario?: number;
  nombre_remitente: string;
  email_remitente: string;
  asunto: string;
  contenido: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, InfoCard],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact implements OnInit {
  private CONTACT_API = 'http://localhost:5000/api/contact/message'; // <-- Asumimos esta ruta

  // Modelo de datos del formulario (Ahora tipado como MessagePayload)
  contactData: MessagePayload = {
    nombre_remitente: '',
    email_remitente: '',
    asunto: '',
    contenido: ''
  };

  isSubmitting: boolean = false;
  submissionSuccess: boolean = false;
  submissionError: boolean = false;
  currentUser: Usuario | null = null;

  constructor(
    private http: HttpClient,
    public authService: AuthService // Lo hacemos público para usarlo en el HTML
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    // Pre-llenar campos si el usuario está logueado
    if (this.currentUser) {
      this.contactData.nombre_remitente = this.currentUser.nombre;
      this.contactData.email_remitente = this.currentUser.email;
    }
  }

  /**
   * Prepara el payload y realiza la llamada a la API.
   */
  async submitForm(form: NgForm): Promise<void> {
    if (form.invalid) return;

    this.isSubmitting = true;
    this.submissionSuccess = false;
    this.submissionError = false;
    
    // Si el usuario está logueado, ajustamos el payload
    if (this.currentUser) {
        this.contactData.id_usuario = this.currentUser.id_usuario;
        // Nombre y email ya están pre-llenados y serán enviados al backend para registro redundante
    } else {
        // Aseguramos que no haya id_usuario para un mensaje anónimo
        delete this.contactData.id_usuario;
    }
    
    const payload = {
        id_usuario: this.contactData.id_usuario,
        nombre_remitente: this.contactData.nombre_remitente,
        email_remitente: this.contactData.email_remitente,
        asunto: this.contactData.asunto,
        contenido: this.contactData.contenido,
    };


    try {
      // Ejecutar la llamada HTTP
      const res: any = await firstValueFrom(this.http.post(this.CONTACT_API, payload));

      console.log('Mensaje Enviado:', res);
      this.submissionSuccess = true;
      
      // Limpiar el formulario
      this.contactData.asunto = '';
      this.contactData.contenido = '';
      // Si está logueado, mantenemos nombre/email, si no, limpiamos
      if (!this.currentUser) {
          this.contactData.nombre_remitente = '';
          this.contactData.email_remitente = '';
      }
      form.resetForm(this.contactData); // Reinicia el estado de validación

      setTimeout(() => {
        this.submissionSuccess = false;
      }, 5000);

    } catch (err) {
      console.error('Error al enviar mensaje:', err);
      this.submissionError = true;
    } finally {
      this.isSubmitting = false;
    }
  }
}