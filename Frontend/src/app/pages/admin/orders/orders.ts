import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../../services/order.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.html',
  styleUrl: './orders.scss'
})
export class Orders implements OnInit {
  orders = signal<any[]>([]);
  selectedOrder = signal<any | null>(null);
  isLoading = signal(false);
  isDetailLoading = signal(false);
  isUpdating = signal(false);
  env = environment;

  constructor(
    private orderService: OrderService
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading.set(true);
    this.orderService.getAdminOrders().subscribe({
      next: (data: any[]) => {
        this.orders.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  viewDetails(orderId: number) {
    this.isDetailLoading.set(true);
    this.orderService.getOrderDetails(orderId).subscribe({
      next: (res: any) => {
        this.selectedOrder.set(res);
        this.isDetailLoading.set(false);
      },
      error: () => this.isDetailLoading.set(false)
    });
  }

  downloadReceipt(orderId: number): void {
    this.orderService.downloadPDF(orderId).subscribe({
      next: (blob) => {
        const file = new Blob([blob], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(file);
        window.open(url, '_blank');
        
        
        if (this.selectedOrder()) {
          this.viewDetails(orderId);
        } else {
          this.loadOrders();
        }
      },
      error: () => alert('Error al generar el PDF')
    });
  }

  updateStatus(id: number, paymentStatus: string, shippingStatus: string) {
    if (!confirm('¿Estás seguro de actualizar el estado de este pedido?')) return;
    
    this.isUpdating.set(true);
    this.orderService.updateOrderStatus(id, {
      estado_pago: paymentStatus,
      estado_envio: shippingStatus
    }).subscribe({
      next: () => {
        this.isUpdating.set(false);
        this.loadOrders();
        this.viewDetails(id); 
      },
      error: (err) => {
        alert(err.message);
        this.isUpdating.set(false);
      }
    });
  }

  closeDetails() {
    this.selectedOrder.set(null);
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PENDIENTE': return 'bg-warning text-dark';
      case 'PROCESANDO': return 'bg-info text-white';
      case 'ENVIADO': return 'bg-primary text-white';
      case 'ENTREGADO': return 'bg-success text-white';
      case 'ADUANAS': return 'bg-secondary text-white';
      case 'RECHAZADO': return 'bg-danger text-white';
      default: return 'bg-secondary text-white';
    }
  }
}
