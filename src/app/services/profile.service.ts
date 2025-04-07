import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  phone?: string;
  address?: string;
  role: string;
  status: string;
  createdAt: Date;
  hasAvatar: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'http://localhost:5000/api/profile';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Get current user profile
  getProfile(): Observable<UserProfile> {
    return this.http.get(this.apiUrl, {
      headers: this.getAuthHeaders()
    }).pipe(
      map((response: any) => {
        return response && response.data ? response.data : response;
      }),
      catchError(this.handleError)
    );
  }

  // Update user profile
  updateProfile(profileData: {
    fullName?: string;
    phone?: string;
    address?: string;
    email?: string;
  }): Observable<UserProfile> {
    return this.http.put(this.apiUrl, profileData, {
      headers: this.getAuthHeaders()
    }).pipe(
      map((response: any) => {
        return response && response.data ? response.data : response;
      }),
      catchError(this.handleError)
    );
  }

  // Upload avatar
  uploadAvatar(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.http.put(`${this.apiUrl}/avatar`, formData, {
      headers: this.getAuthHeaders(true)
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Get avatar URL
  getAvatarUrl(userId?: string): string {
    try {
      // Generate a static timestamp based on a reasonable refresh interval (e.g., every 5 minutes)
      const timestamp = Math.floor(Date.now() / (5 * 60 * 1000));
      
      // Generate URL with the API base URL
      const baseApiUrl = 'http://localhost:5000/api/profile';
      
      if (userId) {
        return `${baseApiUrl}/avatar/${userId}?${timestamp}`;
      }
      return `${baseApiUrl}/avatar?${timestamp}`;
    } catch (error) {
      console.error('Error generating avatar URL:', error);
      return '';
    }
  }

  private getAuthHeaders(isFormData = false): HttpHeaders {
    const token = this.authService.token;
    let headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    // Don't set Content-Type for FormData (multipart/form-data)
    if (!isFormData) {
      headers = headers.append('Content-Type', 'application/json');
    }
    
    return headers;
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