import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, Message } from '../message.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-bubble',
  templateUrl: './chat-bubble.component.html',
  styleUrls: ['./chat-bubble.component.css']
})
export class ChatBubbleComponent implements OnInit, OnDestroy {
  isOpen = false;
  messages: Message[] = [];
  messageForm: FormGroup;
  userId: string;
  userName: string;
  unreadCount = 0;
  private subscriptions: Subscription[] = [];

  constructor(
    private messageService: MessageService,
    private fb: FormBuilder
  ) {
    // Get user details from localStorage or your auth service
    this.userId = localStorage.getItem('userId') || 'USER_' + Date.now();
    this.userName = localStorage.getItem('userName') || 'Resident';
    
    this.messageForm = this.fb.group({
      content: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Subscribe to messages
    this.subscriptions.push(
      this.messageService.getMessagesForUser(this.userId).subscribe(messages => {
        this.messages = messages;
        // Auto-scroll to bottom when new messages arrive
        setTimeout(() => this.scrollToBottom(), 0);
      })
    );

    // Subscribe to unread count
    this.subscriptions.push(
      this.messageService.getUnreadCount(this.userId).subscribe(count => {
        this.unreadCount = count;
      })
    );
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  scrollToBottom() {
    const messageContainer = document.querySelector('.messages-container');
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.messageService.markAsRead(this.userId);
      setTimeout(() => this.scrollToBottom(), 0);
    }
  }

  sendMessage() {
    if (this.messageForm.valid) {
      const content = this.messageForm.get('content')?.value;
      
      this.messageService.sendMessage({
        senderId: this.userId,
        senderName: this.userName,
        receiverId: 'ADMIN',
        content: content
      });

      this.messageForm.reset();
      setTimeout(() => this.scrollToBottom(), 0);
    }
  }
}