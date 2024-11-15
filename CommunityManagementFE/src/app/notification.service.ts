import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Notification {
  notifications?: number;  // matches the Long notifications in backend
  content: string;        // matches the String content in backend
  date?: Date;           // matches the Date date in backend
  recipientRole: string;  // matches the String recipientRole in backend
}

@Injectable({ 
  providedIn: 'root'
})
export class NotificationService {
  private baseUrl = 'http://localhost:8082/notifications'; // Update port as needed

  constructor(private http: HttpClient) { }

  createNotification(notification: Notification): Observable<Notification> {
    return this.http.post<Notification>(this.baseUrl, notification);
  }

  getNotificationsByRole(role: string): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.baseUrl}/${role}`);
  }
}