import { Component, OnInit, signal, inject, ViewChild, ElementRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../../services/admin.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { FormsModule } from '@angular/forms';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  private adminService = inject(AdminService);

  totalSales = signal(0);
  pendingOrders = signal(0);
  lowStockCount = signal(0);
  activeChats = signal(0);
  
  dateRange = signal('30d');
  isLoading = signal(true);

  @ViewChild('salesChart') salesChartRef!: ElementRef;
  @ViewChild('categoryChart') categoryChartRef!: ElementRef;
  @ViewChild('usersChart') usersChartRef!: ElementRef;
  @ViewChild('productsChart') productsChartRef!: ElementRef;
  @ViewChild('paymentsChart') paymentsChartRef!: ElementRef;
  
  private salesChart?: Chart;
  private categoryChart?: Chart;
  private usersChart?: Chart;
  private productsChart?: Chart;
  private paymentsChart?: Chart;

  constructor() {
    effect(() => {
      this.loadDashboardData(this.dateRange());
    });
  }

  ngOnInit() {}

  async loadDashboardData(range: string) {
    this.isLoading.set(true);
    this.adminService.getDashboardStats(range).subscribe({
      next: (data) => {
        if (data) {
          this.totalSales.set(data.totalSales || 0);
          this.pendingOrders.set(data.pendingOrders || 0);
          this.lowStockCount.set(data.lowStockCount || 0);
          this.activeChats.set(data.activeChats || 0);
          
          this.updateCharts(data);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
      }
    });
  }

  updateCharts(data: any) {
    this.initSalesChart(data.salesTimeline);
    this.initCategoryChart(data.categoryStats);
    this.initUsersChart(data.userRegistrations);
    this.initProductsChart(data.topProducts);
    this.initPaymentsChart(data.paymentMethods);
  }

  initSalesChart(timeline: any) {
    if (this.salesChart) this.salesChart.destroy();
    if (!this.salesChartRef || !timeline?.labels) return;
    
    const ctx = this.salesChartRef.nativeElement.getContext('2d');
    this.salesChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: timeline.labels,
        datasets: [{
          label: 'Ventas (S/.)',
          data: timeline.data,
          borderColor: '#1a5c20',
          backgroundColor: 'rgba(26, 92, 32, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  initCategoryChart(stats: any) {
    if (this.categoryChart) this.categoryChart.destroy();
    if (!this.categoryChartRef || !stats?.labels) return;

    const ctx = this.categoryChartRef.nativeElement.getContext('2d');
    this.categoryChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: stats.labels,
        datasets: [{
          data: stats.data,
          backgroundColor: ['#1a5c20', '#4caf50', '#8bc34a', '#cddc39', '#e8f5e9'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }

  initUsersChart(stats: any) {
    if (this.usersChart) this.usersChart.destroy();
    if (!this.usersChartRef || !stats?.labels) return;

    const ctx = this.usersChartRef.nativeElement.getContext('2d');
    this.usersChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: stats.labels,
        datasets: [{
          label: 'Nuevos Usuarios',
          data: stats.data,
          backgroundColor: '#34c759',
          borderRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
      }
    });
  }

  initProductsChart(stats: any) {
    if (this.productsChart) this.productsChart.destroy();
    if (!this.productsChartRef || !stats?.labels) return;

    const ctx = this.productsChartRef.nativeElement.getContext('2d');
    this.productsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: stats.labels,
        datasets: [{
          label: 'Unidades Vendidas',
          data: stats.data,
          backgroundColor: '#1a5c20',
          borderRadius: 5
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
      }
    });
  }

  initPaymentsChart(stats: any) {
    if (this.paymentsChart) this.paymentsChart.destroy();
    if (!this.paymentsChartRef || !stats?.labels) return;

    const ctx = this.paymentsChartRef.nativeElement.getContext('2d');
    this.paymentsChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: stats.labels,
        datasets: [{
          data: stats.data,
          backgroundColor: ['#0084ff', '#32d74b', '#ff9f0a', '#5856d6', '#ff3b30'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'right' } }
      }
    });
  }
}
