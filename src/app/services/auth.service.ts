import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

export interface User {
  id?: string;
  _id?: string; // MongoDB ID
  username: string;
  email?: string;
  role: 'admin' | 'user' | null;
  status?: 'active' | 'inactive'; // Add status property
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  private tokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {
    // Check if user is already logged in from previous session
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('currentUser');
    
    if (storedToken && storedUser) {
      this.tokenSubject.next(storedToken);
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  register(userData: { username: string, email: string, password: string, role?: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, userData)
      .pipe(
        tap(response => {
          this.storeUserData(response);
        }),
        catchError(this.handleError)
      );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          this.storeUserData(response);
        }),
        catchError(this.handleError)
      );
  }

  logout(): Observable<any> {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.tokenSubject.next(null);
    
    return this.http.get(`${this.apiUrl}/auth/logout`);
  }

  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/me`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  private storeUserData(response: AuthResponse): void {
    if (response.success && response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      this.tokenSubject.next(response.token);
      this.currentUserSubject.next(response.user);
    }
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.tokenSubject.value;
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

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get token(): string | null {
    return this.tokenSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.currentUser && !!this.token;
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  isUser(): boolean {
    return this.currentUser?.role === 'user';
  }
} 