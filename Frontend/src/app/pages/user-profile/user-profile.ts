import { Component, OnInit, signal, ElementRef, ViewChild, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { UserDataService } from '../../../services/user-data.service';
import { Pedido, Direccion, Pais, Mensaje, Conversacion } from '../../../models';
import { OrderService } from '../../../services/order.service';
import { MessageService } from '../../../services/message.service';
import { SocketService } from '../../../services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css'
})
export class UserProfile implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  public authService = inject(AuthService);
  private userDataService = inject(UserDataService);
  private orderService = inject(OrderService);
  private messageService = inject(MessageService);
  private socketService = inject(SocketService);

  activeTab: 'profile' | 'orders' | 'addresses' | 'messages' = 'profile';
  
  // Datos de usuario
  userData = {
    nombre: '',
    email: '',
    telefono: '',
    rol: ''
  };

  // Pedidos
  userOrders: any[] = [];
  selectedOrder = signal<any | null>(null);
  isDetailLoading = signal(false);

  // Direcciones
  direcciones: Direccion[] = [];
  paises: Pais[] = [];
  showAddressModal = false;
  newAddress = {
    id_pais: 1,
    nombre_direccion: '',
    estado_region: '',
    ciudad: '',
    codigo_postal: '',
    direccion_exacta: '',
    referencia: ''
  };

  // Chat
  messages = signal<Mensaje[]>([]);
  newMessage = signal('');
  isMessagesLoading = signal(false);
  currentConversation = signal<Conversacion | null>(null);
  private socketSubscription?: Subscription;

  isLoading = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Estados de edición
  isEditingProfile = false;
  isChangingPassword = false;

  // Datos para cambio de contraseña
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  ngOnInit(): void {
    if (!this.authService.isAuthenticatedUser()) {
      this.errorMessage = 'Debes iniciar sesión para acceder a tu perfil.';
      this.isLoading = false;
      return;
    }
    this.loadData();
    this.setupSocketListener();
  }

  ngOnDestroy() {
    this.socketSubscription?.unsubscribe();
  }

  setupSocketListener() {
    this.socketSubscription = this.socketService.onMessage().subscribe((msg: Mensaje) => {
      // Sincronización instantánea: Si recibimos un mensaje de nuestra conversación
      if (this.currentConversation()?.id_conversacion === msg.id_conversacion) {
        this.messages.update(current => [...current, msg]);
        setTimeout(() => this.scrollToBottom(), 50);
      }
    });
  }

  async loadData() {
    this.isLoading = true;
    try {
      const user = this.authService.getCurrentUser();
      if (user) {
        this.userData = {
          nombre: user.nombre,
          email: user.email,
          telefono: user.telefono || '',
          rol: user.rol
        };
      }

      this.userDataService.getAddresses().subscribe((res: any) => this.direcciones = res);
      this.userDataService.getCountries().subscribe((res: any) => this.paises = res);
      this.orderService.getMyOrders().subscribe((res: any) => this.userOrders = res);
      
      this.isLoading = false;
    } catch (err) {
      this.errorMessage = 'Error al cargar los datos del perfil';
      this.isLoading = false;
    }
  }

  setActiveTab(tab: 'profile' | 'orders' | 'addresses' | 'messages'): void {
    this.activeTab = tab;
    if (tab !== 'orders') this.closeOrderDetails();
    if (tab === 'messages') {
      this.loadMessages();
    }
  }

  // --- MÉTODOS DE PEDIDOS ---
  viewOrderDetails(orderId: number) {
    this.isDetailLoading.set(true);
    this.orderService.getOrderDetails(orderId).subscribe({
      next: (res: any) => {
        this.selectedOrder.set(res);
        this.isDetailLoading.set(false);
      },
      error: () => this.isDetailLoading.set(false)
    });
  }

  closeOrderDetails() {
    this.selectedOrder.set(null);
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PENDIENTE': return 'bg-warning text-dark';
      case 'PAGADO': return 'bg-success text-white';
      case 'PROCESANDO': return 'bg-info text-white';
      case 'ENVIADO': return 'bg-primary text-white';
      case 'ENTREGADO': return 'bg-success text-white';
      default: return 'bg-secondary text-white';
    }
  }

  // --- MÉTODOS DE DIRECCIONES ---
  openAddressModal() {
    this.showAddressModal = true;
  }

  closeAddressModal() {
    this.showAddressModal = false;
  }

  saveAddress() {
    this.userDataService.addAddress(this.newAddress).subscribe({
      next: () => {
        this.userDataService.getAddresses().subscribe((res: any) => this.direcciones = res);
        this.closeAddressModal();
      },
      error: (err: any) => alert(err.error?.message || 'Error al guardar dirección')
    });
  }

  // --- MÉTODOS DE CHAT ---
  loadMessages() {
    this.isMessagesLoading.set(true);
    this.messageService.getMyConversation().subscribe({
      next: (res) => {
        this.currentConversation.set(res.conversation);
        this.messages.set(res.messages);
        if (res.conversation?.id_conversacion) {
          this.socketService.joinRoom(res.conversation.id_conversacion);
        }
        this.isMessagesLoading.set(false);
        setTimeout(() => this.scrollToBottom(), 50);
      },
      error: () => {
        this.messages.set([]);
        this.isMessagesLoading.set(false);
      }
    });
  }

  sendMessage() {
    const text = this.newMessage().trim();
    if (!text) return;

    this.newMessage.set('');
    const conv = this.currentConversation();
    
    this.messageService.sendMessage({
      contenido: text,
      id_conversacion: conv?.id_conversacion,
      id_receptor: conv?.id_admin || 1
    }).subscribe({
      next: (res) => {
        // La actualización viene por socket o por el res.data si el backend lo devuelve
        if (res.success && res.data) {
          // this.messages.update(m => [...m, res.data]);
        }
        this.loadMessages();
      },
      error: (err) => console.error('Error al enviar mensaje:', err)
    });
  }

  private scrollToBottom(): void {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    }
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/auth';
  }

  // --- MÉTODOS DE EDICIÓN ---
  toggleEditProfile() {
    this.isEditingProfile = !this.isEditingProfile;
    if (!this.isEditingProfile) {
      // Revertir cambios si se cancela
      const user = this.authService.getCurrentUser();
      if (user) {
        this.userData = {
          nombre: user.nombre,
          email: user.email,
          telefono: user.telefono || '',
          rol: user.rol
        };
      }
    }
  }

  updateProfile() {
    this.userDataService.updateProfile(this.userData).subscribe({
      next: (res) => {
        if (res.success) {
          this.authService.updateUser(res.data);
          this.successMessage = 'Perfil actualizado correctamente';
          this.isEditingProfile = false;
          setTimeout(() => this.successMessage = null, 3000);
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error al actualizar perfil';
        setTimeout(() => this.errorMessage = null, 3000);
      }
    });
  }

  toggleChangePassword() {
    this.isChangingPassword = !this.isChangingPassword;
    if (!this.isChangingPassword) {
      this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
    }
  }

  updatePassword() {
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    this.userDataService.updatePassword({
      currentPassword: this.passwordData.currentPassword,
      newPassword: this.passwordData.newPassword
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMessage = 'Contraseña actualizada correctamente';
          this.isChangingPassword = false;
          this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
          setTimeout(() => this.successMessage = null, 3000);
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error al actualizar contraseña';
        setTimeout(() => this.errorMessage = null, 3000);
      }
    });
  }
}
