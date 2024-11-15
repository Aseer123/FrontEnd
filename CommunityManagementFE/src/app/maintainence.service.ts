import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Task {
  taskId?: number;
  description: string;
  status: string;
  scheduledDate: Date;
  creatorRole: string;
}

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {
  private baseUrl = 'http://localhost:8084/tasks'; // Update port to match your backend

  constructor(private http: HttpClient) { }

  // Headers configuration
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Error handling
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // Create a new task
  createTask(task: Task): Observable<Task> {
    const headers = this.getHeaders();
    return this.http.post<Task>(`${this.baseUrl}/create`, task, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Get all tasks
  getAllTasks(): Observable<Task[]> {
    const headers = this.getHeaders();
    return this.http.get<Task[]>(this.baseUrl, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Get tasks for resident
  getResidentTasks(): Observable<Task[]> {
    const headers = this.getHeaders();
    return this.http.get<Task[]>(`${this.baseUrl}/resident`, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Get task by ID
  getTaskById(id: number): Observable<Task> {
    const headers = this.getHeaders();
    return this.http.get<Task>(`${this.baseUrl}/${id}`, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Update task
  updateTask(id: number, task: Task): Observable<Task> {
    const headers = this.getHeaders();
    return this.http.put<Task>(`${this.baseUrl}/${id}`, task, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Update task status
  updateTaskStatus(taskId: number, newStatus: string): Observable<Task> {
    const headers = this.getHeaders();
    return this.http.patch<Task>(`${this.baseUrl}/${taskId}/status`, { status: newStatus }, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Delete task
  deleteTask(id: number): Observable<void> {
    const headers = this.getHeaders();
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Get tasks by status
  getTasksByStatus(status: string): Observable<Task[]> {
    const headers = this.getHeaders();
    return this.http.get<Task[]>(`${this.baseUrl}/status/${status}`, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Format date for API
  formatDate(date: Date): string {
    return new Date(date).toISOString().split('T')[0];
  }

  // Parse date from API
  parseDate(dateString: string): Date {
    return new Date(dateString);
  }
}