import { Component, signal } from '@angular/core';
// Importamos el Router para acceder a la URL
import { Router, RouterOutlet } from '@angular/router';
import { TopBar } from './components/top-bar/top-bar';
import { Header } from './components/header/header';
import { FooterComponent } from './components/footer/footer';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    TopBar,
    Header,
    FooterComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // Inyectamos el Router
  constructor(private router: Router) {}

  protected readonly title = signal('INKAPT');
  
  // Propiedad para verificar si la ruta actual es una ruta de administración
  // Usamos el estado del signal del Router para reaccionar a los cambios de ruta
  get isAdminRoute(): boolean {
    // Verifica si la URL actual comienza con '/admin'
    return this.router.url.startsWith('/admin');
  }
}