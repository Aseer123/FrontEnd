import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// Interface for API response
export interface FeedbackResponse {
  id?: number;
  message: string;
  status: 'PENDING' | 'RESOLVED';
  userRole: string;
  createdAt?: Date;
}

// Interface for frontend use
export interface Feedback {
  id: number;
  message: string;
  status: 'PENDING' | 'RESOLVED';
  userRole: string;
  createdAt: Date;
}

// Interface for creating new feedback
export interface CreateFeedbackDTO {
  message: string;
  userRole: string;
  status: 'PENDING' | 'RESOLVED';
}

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private baseUrl = 'http://localhost:8084/feedback';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  createFeedback(feedback: CreateFeedbackDTO): Observable<Feedback> {
    const headers = this.getHeaders();
    return this.http.post<Feedback>(`${this.baseUrl}/create`, feedback, { headers })
      .pipe(catchError(this.handleError));
  }


  getAllFeedback(): Observable<Feedback[]> {
    const headers = this.getHeaders();
    return this.http.get<FeedbackResponse[]>(this.baseUrl, { headers })
      .pipe(
        map(responses => responses.map(response => this.transformToFeedback(response))),
        catchError(this.handleError)
      );
  }

  getFeedbackByRole(role: string): Observable<Feedback[]> {
    const headers = this.getHeaders();
    return this.http.get<FeedbackResponse[]>(`${this.baseUrl}/role/${role}`, { headers })
      .pipe(
        map(responses => responses.map(response => this.transformToFeedback(response))),
        catchError(this.handleError)
      );
  }

  updateFeedback(id: number, feedback: Partial<Feedback>): Observable<Feedback> {
    const headers = this.getHeaders();
    return this.http.put<FeedbackResponse>(`${this.baseUrl}/${id}`, feedback, { headers })
      .pipe(
        map(response => this.transformToFeedback(response)),
        catchError(this.handleError)
      );
  }

  private transformToFeedback(response: FeedbackResponse): Feedback {
    if (!response.id) {
      throw new Error('Feedback ID is required');
    }
    return {
      id: response.id,
      message: response.message,
      status: response.status,
      userRole: response.userRole,
      createdAt: response.createdAt || new Date()
    };
  }
}