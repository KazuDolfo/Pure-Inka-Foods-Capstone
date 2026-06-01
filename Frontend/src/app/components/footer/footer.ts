
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class FooterComponent {
  
  currentYear: number = new Date().getFullYear();
  
  
  contactInfo = {
    email: 'pureinkafoods@gmail.com',
    phone: '+1 217-919-0170',
    social: {
      facebook: '#',
      instagram: '#',
      twitter: '#'
    }
  };

  subscribeEmail: string = '';

  onSubscribe(event: Event) {
    event.preventDefault();
    if (this.subscribeEmail) {
      alert(`Gracias por suscribirte con: ${this.subscribeEmail}`);
      this.subscribeEmail = '';
    }
  }
  }