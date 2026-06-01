import { Component, OnInit, signal, ElementRef, ViewChild, inject, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
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
  styleUrl: './user-profile.scss'
})
export class UserProfile implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  public authService = inject(AuthService);
  private userDataService = inject(UserDataService);
  private orderService = inject(OrderService);
  private messageService = inject(MessageService);
  private socketService = inject(SocketService);

  activeTab: 'profile' | 'orders' | 'addresses' | 'messages' = 'profile';
  
  userData = {
    nombre: '',
    email: '',
    telefono: '',
    rol: ''
  };

  userOrders: any[] = [];
  selectedOrder = signal<any | null>(null);
  isDetailLoading = signal(false);

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

  messages = signal<Mensaje[]>([]);
  newMessage = signal('');
  isMessagesLoading = signal(false);
  currentConversation = signal<Conversacion | null>(null);
  private socketSubscription?: Subscription;
  private route = inject(ActivatedRoute);

  isLoading = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  isEditingProfile = false;
  isChangingPassword = false;

  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor() {
    
    effect(() => {
      const user = this.authService.getCurrentUser();
      if (user) {
        this.userData = {
          nombre: user.nombre,
          email: user.email,
          telefono: user.telefono || '',
          rol: user.rol
        };
      }
    });
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticatedUser()) {
      this.errorMessage = 'Debes iniciar sesión para acceder a tu perfil.';
      this.isLoading = false;
      return;
    }
    this.loadData();
    this.setupSocketListener();
    
    
    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'messages') {
        this.setActiveTab('messages');
      }
    });
  }

  ngOnDestroy() {
    this.socketSubscription?.unsubscribe();
  }

  setupSocketListener() {
    this.socketSubscription = this.socketService.onMessage().subscribe((msg: Mensaje) => {
      if (this.currentConversation()?.id_conversacion === msg.id_conversacion) {
        this.messages.update(current => [...current, msg]);
        setTimeout(() => this.scrollToBottom(), 50);
      }
    });
  }

  async loadData() {
    this.isLoading = true;
    try {
      
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

  downloadReceipt(orderId: number): void {
    this.orderService.downloadPDF(orderId).subscribe({
      next: (blob) => {
        const file = new Blob([blob], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(file);
        window.open(url, '_blank');
        
        
        if (this.selectedOrder()) {
          this.viewOrderDetails(orderId);
        } else {
          this.orderService.getMyOrders().subscribe(res => this.userOrders = res);
        }
      },
      error: () => {
        this.errorMessage = 'No se pudo generar el comprobante';
        setTimeout(() => this.errorMessage = null, 3000);
      }
    });
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
        this.loadMessages();
      },
      error: (err) => {}
    });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      try {
        if (this.scrollContainer) {
          const el = this.scrollContainer.nativeElement;
          el.scrollTo({
            top: el.scrollHeight,
            behavior: 'smooth'
          });
        }
      } catch (err) {}
    }, 100);
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/auth';
  }

  toggleEditProfile() {
    this.isEditingProfile = !this.isEditingProfile;
    if (!this.isEditingProfile) {
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

