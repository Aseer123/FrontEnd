import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-user-sign-up-page',
  templateUrl: './user-sign-up-page.component.html',
  styleUrls: ['./user-sign-up-page.component.css']
})
export class UserSignUpPageComponent {
  signupForm: FormGroup;
  roles: string[] = ['RESIDENT', 'ADMIN'];
  loading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      fullName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(/^[a-zA-Z\s]*$/)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]],
      phone: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{10}$/)
      ]],
      username: ['', [
        Validators.required,
        Validators.minLength(4),
        Validators.pattern(/^[a-zA-Z0-9_-]*$/)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/)
      ]],
      role: ['RESIDENT', Validators.required]
    });
  }

  // Getter methods for form controls
  get f() {
    return this.signupForm.controls;
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.loading = true;
      this.errorMessage = null;

      const userData = {
        ...this.signupForm.value,
        createdAt: new Date().toISOString()
      };

      this.authService.register(userData).subscribe({
        next: () => {
          this.loading = false;
          // Optional: Show success message
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
          console.error('Registration failed:', error);
        }
      });
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.signupForm.controls).forEach(key => {
        const control = this.signupForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  // Helper methods for validation messages
  getErrorMessage(controlName: string): string {
    const control = this.signupForm.get(controlName);
    if (control?.errors) {
      if (control.errors['required']) {
        return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} is required`;
      }
      if (control.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (control.errors['minlength']) {
        return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} must be at least ${control.errors['minlength'].requiredLength} characters`;
      }
      if (control.errors['pattern']) {
        switch (controlName) {
          case 'fullName':
            return 'Name should only contain letters and spaces';
          case 'phone':
            return 'Please enter a valid 10-digit phone number';
          case 'username':
            return 'Username can only contain letters, numbers, underscores, and hyphens';
          case 'password':
            return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
          default:
            return 'Invalid format';
        }
      }
    }
    return '';
  }

  // Reset form
  resetForm() {
    this.signupForm.reset({
      role: 'RESIDENT'
    });
    this.errorMessage = null;
  }

  // Check if field is invalid
  isFieldInvalid(fieldName: string): boolean {
    const field = this.signupForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }
}