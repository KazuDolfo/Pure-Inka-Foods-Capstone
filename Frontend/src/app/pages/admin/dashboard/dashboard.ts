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
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  private adminService = inject(AdminService);

  // Stats
  totalSales = signal(0);
  pendingOrders = signal(0);
  lowStockCount = signal(0);
  activeChats = signal(0);
  
  dateRange = signal('30d');
  isLoading = signal(true);

  @ViewChild('salesChart') salesChartRef!: ElementRef;
  @ViewChild('categoryChart') categoryChartRef!: ElementRef;
  
  private salesChart?: Chart;
  private categoryChart?: Chart;

  constructor() {
    // Reload data when dateRange changes
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
        console.error('Error loading dashboard stats:', err);
        this.isLoading.set(false);
      }
    });
  }

  updateCharts(data: any) {
    this.initSalesChart(data.salesTimeline);
    this.initCategoryChart(data.categoryStats);
  }

  initSalesChart(timeline: any) {
    if (this.salesChart) this.salesChart.destroy();
    
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
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  initCategoryChart(stats: any) {
    if (this.categoryChart) this.categoryChart.destroy();

    const ctx = this.categoryChartRef.nativeElement.getContext('2d');
    this.categoryChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: stats.labels,
        datasets: [{
          data: stats.data,
          backgroundColor: ['#1a5c20', '#4caf50', '#8bc34a', '#cddc39'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        cutout: '70%',
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }
}
