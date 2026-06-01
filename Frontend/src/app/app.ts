import { Component, signal, inject } from '@angular/core';

import { Router, RouterOutlet } from '@angular/router';
import { TopBar } from './components/top-bar/top-bar';
import { Header } from './components/header/header';
import { FooterComponent } from './components/footer/footer';
import { AuthService } from '../services/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    TopBar,
    Header,
    FooterComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private router = inject(Router);
  public authService = inject(AuthService);

  protected readonly title = signal('INKAPT');
  
  
  get isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }

  
  get showClientNav(): boolean {
    return !this.isAdminRoute && !this.authService.isAdmin();
  }
}