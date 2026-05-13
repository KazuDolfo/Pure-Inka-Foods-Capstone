import { Component, OnInit, signal, ElementRef, ViewChild, inject, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../../../services/message.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { AdminService } from '../../../../services/admin.service';
import { SocketService } from '../../../../services/socket.service';
import { Subscription } from 'rxjs';
import { Mensaje, Conversacion } from '../../../../models';

@Component({
  selector: 'app-admin-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messages.html',
  styleUrls: ['./messages.css']
})
export class MessagesComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  @ViewChild('fileInput') private fileInput!: ElementRef;

  private messageService = inject(MessageService);
  private adminService = inject(AdminService);
  private socketService = inject(SocketService);
  public authService = inject(AuthService);

  // Signals de Estado
  conversations = signal<Conversacion[]>([]);
  selectedConv = signal<Conversacion | null>(null);
  messages = signal<Mensaje[]>([]);
  
  // UI Signals
  newMessage = signal('');
  isSending = signal(false);
  isLoadingChat = signal(false);
  isSidebarLoading = signal(false);
  isClientInfoLoading = signal(false);
  selectedFile: File | null = null;

  // Detalles del Cliente
  clientProfile = signal<any | null>(null);
  clientOrders = signal<any[]>([]);

  private socketSub?: Subscription;

  constructor() {
    effect(() => {
      const conv = this.selectedConv();
      if (conv) {
        this.loadClientData(conv.id_cliente);
        this.socketService.joinRoom(conv.id_conversacion);
      }
    });
  }

  ngOnInit() {
    this.loadConversations();
    this.initRealTime();
  }

  ngOnDestroy() {
    this.socketSub?.unsubscribe();
  }

  initRealTime() {
    this.socketSub = this.socketService.onMessage().subscribe((msg: Mensaje) => {
      if (this.selectedConv()?.id_conversacion === msg.id_conversacion) {
        this.messages.update(prev => [...prev, msg]);
        this.messageService.markAsRead(msg.id_conversacion).subscribe();
        setTimeout(() => this.scrollToBottom(), 50);
      }
      this.updateSidebar(msg);
    });
  }

  loadConversations() {
    this.isSidebarLoading.set(true);
    this.messageService.getAdminConversations().subscribe({
      next: (list) => {
        this.conversations.set(list);
        this.isSidebarLoading.set(false);
      },
      error: () => this.isSidebarLoading.set(false)
    });
  }

  selectConversation(conv: Conversacion) {
    if (this.selectedConv()?.id_conversacion === conv.id_conversacion) return;
    
    this.selectedConv.set(conv);
    this.isLoadingChat.set(true);
    this.messages.set([]);

    this.messageService.getAdminConversationById(conv.id_conversacion).subscribe({
      next: (res) => {
        this.messages.set(res.messages);
        this.isLoadingChat.set(false);
        this.markSelectedAsRead();
        setTimeout(() => this.scrollToBottom(), 50);
      },
      error: () => this.isLoadingChat.set(false)
    });
  }

  loadClientData(clientId: number) {
    this.isClientInfoLoading.set(true);
    this.adminService.getUserProfile(clientId).subscribe(p => this.clientProfile.set(p));
    this.adminService.getUserOrders(clientId).subscribe(o => {
      this.clientOrders.set(o);
      this.isClientInfoLoading.set(false);
    });
  }

  sendMessage() {
    const text = this.newMessage().trim();
    if (!text && !this.selectedFile) return;

    const conv = this.selectedConv();
    if (!conv) return;

    this.isSending.set(true);
    
    // El admin envía usando id_conversacion obligatorio (Punto 1.4)
    this.messageService.sendMessage({
      contenido: text,
      id_conversacion: conv.id_conversacion,
      image: this.selectedFile || undefined
    }).subscribe({
      next: (res) => {
        this.isSending.set(false);
        this.newMessage.set('');
        this.selectedFile = null;
        if (res.success && res.data) {
           // this.messages.update(m => [...m, res.data]);
        }
        this.loadMessages(conv.id_conversacion);
      },
      error: () => this.isSending.set(false)
    });
  }

  // Método auxiliar para recargar mensajes (usado tras enviar si no viene por socket)
  loadMessages(conversationId: number) {
    this.messageService.getAdminConversationById(conversationId).subscribe(res => {
      this.messages.set(res.messages);
      setTimeout(() => this.scrollToBottom(), 50);
    });
  }

  updateSidebar(msg: Mensaje) {
    this.conversations.update(list => {
      const updated = list.map(c => {
        if (c.id_conversacion === msg.id_conversacion) {
          return {
            ...c,
            ultimo_mensaje: msg.contenido,
            no_leidos: this.selectedConv()?.id_conversacion === msg.id_conversacion ? 0 : ((c.no_leidos || 0) + 1),
            ultima_actualizacion: new Date().toISOString()
          };
        }
        return c;
      });
      return updated.sort((a, b) => new Date(b.ultima_actualizacion).getTime() - new Date(a.ultima_actualizacion).getTime());
    });
  }

  markSelectedAsRead() {
    const conv = this.selectedConv();
    if (conv) {
      this.conversations.update(list => 
        list.map(c => c.id_conversacion === conv.id_conversacion ? { ...c, no_leidos: 0 } : c)
      );
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  private scrollToBottom() {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    }
  }

  getStatusBadgeClass = (s: string) => s === 'ENTREGADO' ? 'bg-success' : 'bg-warning';
}
