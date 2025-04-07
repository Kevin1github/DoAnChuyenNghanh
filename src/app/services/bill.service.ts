import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BillService {
  private apiUrl = environment.apiUrl + '/bills';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Get token from auth service
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.token;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  // Extract data from response if it has a data property
  private extractData(response: any): any {
    return response && response.data ? response.data : response;
  }

  // Get all bills
  getBills(): Observable<any> {
    return this.http.get(this.apiUrl, { headers: this.getAuthHeaders() })
      .pipe(map(this.extractData));
  }

  // Get bill by id
  getBillById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() })
      .pipe(map(this.extractData));
  }

  // Get bills by user id
  getBillsByUserId(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${userId}`, { headers: this.getAuthHeaders() })
      .pipe(map(this.extractData));
  }

  // Create bill
  createBill(billData: any): Observable<any> {
    return this.http.post(this.apiUrl, billData, { headers: this.getAuthHeaders() });
  }

  // Update bill
  updateBill(id: string, billData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, billData, { headers: this.getAuthHeaders() });
  }

  // Update bill status
  updateBillStatus(id: string, statusData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status`, statusData, { headers: this.getAuthHeaders() });
  }

  // Delete bill
  deleteBill(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  // Generate bills for all users
  generateBillsForAllUsers(billData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/generate-all`, billData, { headers: this.getAuthHeaders() });
  }

  // Get my bills (for logged in user)
  getMyBills(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/user-bills/my-bills`, { headers: this.getAuthHeaders() })
      .pipe(map(this.extractData));
  }

  // Pay a bill
  payBill(id: string, paymentData: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/user-bills/${id}/pay`, paymentData, { headers: this.getAuthHeaders() });
  }

  // Get payment history for logged in user
  getPaymentHistory(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/user-bills/payment-history`, { headers: this.getAuthHeaders() })
      .pipe(map(this.extractData));
  }
} 