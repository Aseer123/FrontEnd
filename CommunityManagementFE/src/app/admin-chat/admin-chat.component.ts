import { Component, OnInit } from '@angular/core';
import { ChatUser, Message, MessageService } from '../message.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-admin-chat',
  templateUrl: './admin-chat.component.html',
  styleUrls: ['./admin-chat.component.css']
})
export class AdminChatComponent implements OnInit {
  activeUsers: ChatUser[] = [];
  selectedUser?: ChatUser;
  messages: Message[] = [];
  messageForm: FormGroup;

  constructor(
    private messageService: MessageService,
    private fb: FormBuilder
  ) {
    this.messageForm = this.fb.group({
      content: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.messageService.getActiveUsers().subscribe(users => {
      this.activeUsers = users;
    });
  }

  selectUser(user: ChatUser) {
    this.selectedUser = user;
    this.loadMessages(user.id);
  }

  loadMessages(userId: string) {
    this.messageService.getMessagesForUser(userId).subscribe(messages => {
      this.messages = messages;
    });
  }

  sendMessage() {
    if (this.messageForm.valid && this.selectedUser) {
      this.messageService.sendMessage({
        senderId: 'ADMIN',
        senderName: 'Admin',
        receiverId: this.selectedUser.id,
        content: this.messageForm.get('content')?.value
      });
      this.messageForm.reset();
    }
  }
}
