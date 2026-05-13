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
  styleUrls: ['./orders.css']
})
export class Orders implements OnInit {
  orders = signal<any[]>([]);
  selectedOrder = signal<any | null>(null);
  isLoading = signal(false);
  isDetailLoading = signal(false);

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
