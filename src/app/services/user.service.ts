import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService, User } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:5000/api/users';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Get all users
  getUsers(): Observable<any> {
    return this.http.get(this.apiUrl, {
      headers: this.getAuthHeaders()
    }).pipe(
      map((response: any) => {
        // Extract data array from response if it exists
        return response && response.data ? response.data : response;
      }),
      catchError(this.handleError)
    );
  }

  // Get user by ID
  getUser(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map((response: any) => {
        return response && response.data ? response.data : response;
      }),
      catchError(this.handleError)
    );
  }

  // Create new user
  createUser(userData: any): Observable<any> {
    return this.http.post(this.apiUrl, userData, {
      headers: this.getAuthHeaders()
    }).pipe(
      map((response: any) => {
        return response && response.data ? response.data : response;
      }),
      catchError(this.handleError)
    );
  }

  // Update user
  updateUser(id: string, userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, userData, {
      headers: this.getAuthHeaders()
    }).pipe(
      map((response: any) => {
        return response && response.data ? response.data : response;
      }),
      catchError(this.handleError)
    );
  }

  // Delete user
  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.token;
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.error || `Error Code: ${error.status}, Message: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
} 