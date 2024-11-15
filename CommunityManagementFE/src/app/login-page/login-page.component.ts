import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (token: string) => {
          // Get role from token
          const userRole = this.authService.getUserRoleFromToken(token);
          
          // Navigate based on role
          if (userRole?.toUpperCase() === 'RESIDENT') {
            this.router.navigate(['/resident']);
          } else if (userRole?.toUpperCase() === 'ADMIN') {
            this.router.navigate(['/admin']);
          } else {
            // If role validation is needed, you can use the validateRole method
            this.authService.validateRole(token, 'RESIDENT').subscribe({
              next: () => this.router.navigate(['/resident']),
              error: () => {
                this.authService.validateRole(token, 'ADMIN').subscribe({
                  next: () => this.router.navigate(['/admin']),
                  error: () => {
                    this.errorMessage = 'Invalid role';
                    localStorage.removeItem('token');
                  }
                });
              }
            });
          }
        },
        error: (error) => {
          console.error('Login failed:', error);
          this.errorMessage = 'Invalid username or password';
        }
      });
    }
  }
}