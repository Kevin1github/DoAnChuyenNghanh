import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import Chart from 'chart.js/auto';
import { ReportService } from '../../../services/report.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {
  @ViewChild('revenueChart') revenueChart!: ElementRef;
  
  dashboardData: any = {
    totalUsers: 0,
    totalBills: 0,
    totalRevenue: 0
  };
  
  recentPayments: any[] = [];
  loading = true;
  chart: any;

  constructor(
    private reportService: ReportService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadRecentPayments();
  }

  ngAfterViewInit() {
    this.loadRevenueChart();
  }

  loadDashboardData(): void {
    this.reportService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data', error);
        this.toastr.error('Failed to load dashboard data');
        this.loading = false;
      }
    });
  }

  loadRecentPayments(): void {
    this.reportService.getRecentPayments().subscribe({
      next: (data) => {
        this.recentPayments = data;
      },
      error: (error) => {
        console.error('Error loading recent payments', error);
        this.toastr.error('Failed to load recent payments');
      }
    });
  }

  loadRevenueChart(): void {
    this.reportService.getRevenueData().subscribe({
      next: (data) => {
        if (this.chart) {
          this.chart.destroy();
        }
        
        const labels = data.map(item => item.month);
        const values = data.map(item => item.amount);
        
        this.chart = new Chart(this.revenueChart.nativeElement, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: 'Monthly Revenue',
              data: values,
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Revenue ($)'
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Month'
                }
              }
            }
          }
        });
      },
      error: (error) => {
        console.error('Error loading revenue data', error);
        this.toastr.error('Failed to load revenue chart');
      }
    });
  }

  exportReports(format: string): void {
    this.reportService.exportReports(format).subscribe({
      next: (data) => {
        if (format === 'csv') {
          this.reportService.downloadFile(
            data as Blob,
            `payment_report_${new Date().toISOString().slice(0, 10)}.csv`
          );
          this.toastr.success('Report downloaded successfully');
        } else {
          // For JSON format, just show a success message
          this.toastr.success('Report generated successfully');
        }
      },
      error: (error) => {
        console.error('Error exporting report', error);
        this.toastr.error('Failed to export report');
      }
    });
  }
} 