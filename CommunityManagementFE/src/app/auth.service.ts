import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

// Updated UserData interface
export interface UserData {
  username: string;  // Changed from email to username
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8081/auth';
  private currentUserSubject = new BehaviorSubject<UserData | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStoredUserData();
  }

  private loadStoredUserData() {
    const token = localStorage.getItem('token');
    if (token) {
      const userData = this.getUserDataFromToken(token);
      this.currentUserSubject.next(userData);
    }
  }

  login(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, userData, { responseType: 'text' })
      .pipe(
        tap((token: string) => {
          localStorage.setItem('token', token);
          const userRole = this.getUserRoleFromToken(token);
          localStorage.setItem('userRole', userRole);
          
          // Store user data from token
          const userData = this.getUserDataFromToken(token);
          if (userData) {
            localStorage.setItem('userData', JSON.stringify(userData));
            this.currentUserSubject.next(userData);
          }
        }),
        catchError(this.handleError)
      );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, userData)
      .pipe(
        catchError(this.handleError)
      );
  }

  getUserRoleFromToken(token: string): string {
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      return tokenPayload.role || '';
    } catch (error) {
      console.error('Error decoding token:', error);
      return '';
    }
  }

  getUserDataFromToken(token: string): UserData | null {
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      return {
        username: tokenPayload.sub || '', // Using 'sub' claim for username
        role: tokenPayload.role || ''
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  validateToken(token: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/validate/token`, null, {
      params: { token },
      responseType: 'text'
    }).pipe(
      catchError(this.handleError)
    );
  }

  validateRole(token: string, role: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/validate/role`, {
      params: { token, role },
      responseType: 'text'
    }).pipe(
      catchError(this.handleError)
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): UserData | null {
    let userData = this.currentUserSubject.value;
    
    if (!userData) {
      const storedData = localStorage.getItem('userData');
      if (storedData) {
        userData = JSON.parse(storedData);
        this.currentUserSubject.next(userData);
      }
    }
    
    return userData;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  debugTokenInfo(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', tokenPayload);
        console.log('Stored user data:', localStorage.getItem('userData'));
        console.log('Current user subject:', this.currentUserSubject.value);
      } catch (error) {
        console.error('Error debugging token:', error);
      }
    } else {
      console.log('No token found in localStorage');
    }
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      switch (error.status) {
        case 401:
          errorMessage = 'Unauthorized access';
          break;
        case 403:
          errorMessage = 'Forbidden';
          break;
        case 404:
          errorMessage = 'Not found';
          break;
        default:
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}