import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt'; // For decoding JWT
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    private jwtHelper: JwtHelperService,
    private cookieService: CookieService
  ) {}

  handleSubmit() {
    const loginPayload = { email: this.email, password: this.password };
    
    this.http.post('http://localhost:9999/auth/login', loginPayload)
      .subscribe({
        next: (response: any) => {
          const jwtToken = response.token;
          const decodedToken = this.jwtHelper.decodeToken(jwtToken);
          const roles = decodedToken.roles;
          const userRole = roles[0].slice(5); // Remove "ROLE_"

          this.cookieService.set('jwt_token', jwtToken);
          this.cookieService.set('role', userRole);

          const url = userRole === 'ADMIN' ?
            `http://localhost:9999/api/community/management-service/societies/by-email/${this.email}` :
            `http://localhost:9999/api/community/management-service/residents/findby-email/${this.email}`;

          this.http.get(url, { headers: { Authorization: `Bearer ${jwtToken}` } }).subscribe({
            next: (data: any) => {
              if (data) {
                localStorage.setItem('data', JSON.stringify(data));
                this.router.navigate(['/dashboard']);
              }
            },
            error: (err) => {
              if (err.status === 404) {
                // If user does not exist, navigate to registration page
                if (userRole === 'ADMIN') {
                  this.router.navigate(['/admin-register']);
                } else {
                  this.router.navigate(['/user-register']);
                }
              }
            }
          });
        },
        error: (err) => {
          this.errorMessage = err.error.description || 'Login failed';
        }
      });
  }
}
