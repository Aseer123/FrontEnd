import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { UserSignUpPageComponent } from './user-sign-up-page/user-sign-up-page.component';
import { ResidentDashboardComponent } from './resident-dashboard/resident-dashboard.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { ChatBubbleComponent } from './chat-bubble/chat-bubble.component';
import { AdminChatComponent } from './admin-chat/admin-chat.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    UserSignUpPageComponent,
    ResidentDashboardComponent,
    AdminDashboardComponent,
    ChatBubbleComponent,
    AdminChatComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }