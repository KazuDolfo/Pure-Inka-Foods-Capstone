import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms'; 
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';
import { Usuario } from '../../../models/usuario.model'; 

import { RouterModule } from '@angular/router';


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
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact implements OnInit {
  private CONTACT_API = 'http://localhost:5000/api/contact/message'; 

  
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
    public authService: AuthService 
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    if (this.currentUser) {
      this.contactData.nombre_remitente = this.currentUser.nombre;
      this.contactData.email_remitente = this.currentUser.email;
    }
  }

  
  async submitForm(form: NgForm): Promise<void> {
    if (form.invalid) return;

    this.isSubmitting = true;
    this.submissionSuccess = false;
    this.submissionError = false;
    
    
    if (this.currentUser) {
        this.contactData.id_usuario = this.currentUser.id_usuario;
        
    } else {
        
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
      
      const res: any = await firstValueFrom(this.http.post(this.CONTACT_API, payload));

      console.log('Mensaje Enviado:', res);
      this.submissionSuccess = true;
      
      
      this.contactData.asunto = '';
      this.contactData.contenido = '';
      
      if (!this.currentUser) {
          this.contactData.nombre_remitente = '';
          this.contactData.email_remitente = '';
      }
      form.resetForm(this.contactData); 

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