import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.token;
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Get dashboard summary data
   * @returns Dashboard summary stats
   */
  getDashboardData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reports/dashboard`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get revenue data for charts
   * @returns Monthly revenue data
   */
  getRevenueData(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reports/revenue`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get recent payments
   * @returns List of recent payments
   */
  getRecentPayments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reports/recent-payments`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Export reports in various formats
   * @param format Format to export (json, csv)
   * @returns Report data in requested format
   */
  exportReports(format: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/reports/export/${format}`, {
      headers: this.getAuthHeaders(),
      responseType: format === 'csv' ? 'blob' as 'json' : 'json'
    });
  }

  /**
   * Download the exported report
   * @param blob The blob data
   * @param fileName The file name
   */
  downloadFile(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
} 