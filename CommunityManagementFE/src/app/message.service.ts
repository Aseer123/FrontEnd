import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Message {
  id: number;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface ChatUser {
  id: string;
  name: string;
  role: 'ADMIN' | 'RESIDENT';
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private messages = new BehaviorSubject<Message[]>([]);
  private activeUsers = new BehaviorSubject<ChatUser[]>([]);

  constructor() {
    // Load initial messages from localStorage
    const savedMessages = localStorage.getItem('chat_messages');
    if (savedMessages) {
      const messages = JSON.parse(savedMessages);
      this.messages.next(messages);
      this.updateActiveUsers(messages);
    }
  }

  private saveToLocalStorage(messages: Message[]) {
    localStorage.setItem('chat_messages', JSON.stringify(messages));
  }

  private updateActiveUsers(messages: Message[]) {
    const userMap = new Map<string, ChatUser>();

    messages.forEach(msg => {
      if (msg.senderId !== 'ADMIN') {
        if (!userMap.has(msg.senderId)) {
          userMap.set(msg.senderId, {
            id: msg.senderId,
            name: msg.senderName,
            role: 'RESIDENT',
            unreadCount: 0,
            lastMessage: msg.content,
            lastMessageTime: new Date(msg.timestamp)
          });
        }
        // Update unread count
        if (msg.receiverId === msg.senderId && !msg.read) {
          const user = userMap.get(msg.senderId);
          if (user) {
            user.unreadCount++;
          }
        }
        // Update last message
        const user = userMap.get(msg.senderId);
        if (user && new Date(msg.timestamp) > new Date(user.lastMessageTime || 0)) {
          user.lastMessage = msg.content;
          user.lastMessageTime = new Date(msg.timestamp);
        }
      }
    });

    this.activeUsers.next(Array.from(userMap.values()));
  }

  sendMessage(message: Omit<Message, 'id' | 'timestamp' | 'read'>): void {
    const newMessage: Message = {
      id: Date.now(),
      timestamp: new Date(),
      read: false,
      ...message // This ensures all required fields are populated
    };
    
    const currentMessages = this.messages.getValue();
    const updatedMessages = [...currentMessages, newMessage];
    this.messages.next(updatedMessages);
    this.saveToLocalStorage(updatedMessages);
    this.updateActiveUsers(updatedMessages);
  }

  getMessagesForUser(userId: string): Observable<Message[]> {
    return this.messages.pipe(
      map(messages => 
        messages.filter(m => 
          (m.senderId === userId && m.receiverId === 'ADMIN') ||
          (m.senderId === 'ADMIN' && m.receiverId === userId)
        )
      )
    );
  }

  getActiveUsers(): Observable<ChatUser[]> {
    return this.activeUsers.asObservable();
  }

  markAsRead(userId: string): void {
    const currentMessages = this.messages.getValue();
    const updatedMessages = currentMessages.map(m => {
      if (m.receiverId === userId && !m.read) {
        return { ...m, read: true };
      }
      return m;
    });
    this.messages.next(updatedMessages);
    this.saveToLocalStorage(updatedMessages);
    this.updateActiveUsers(updatedMessages);
  }

  getUnreadCount(userId: string): Observable<number> {
    return this.messages.pipe(
      map(messages => 
        messages.filter(m => 
          m.receiverId === userId && !m.read
        ).length
      )
    );
  }

  // Get last message for a user
  getLastMessage(userId: string): Observable<Message | undefined> {
    return this.messages.pipe(
      map(messages => {
        const userMessages = messages.filter(m => 
          (m.senderId === userId && m.receiverId === 'ADMIN') ||
          (m.senderId === 'ADMIN' && m.receiverId === userId)
        );
        return userMessages[userMessages.length - 1];
      })
    );
  }

  // Clear chat history for testing purposes
  clearChat() {
    this.messages.next([]);
    this.activeUsers.next([]);
    localStorage.removeItem('chat_messages');
  }
}