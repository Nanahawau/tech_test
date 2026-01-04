import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthService } from '../../../../common/services/auth.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

interface LoginState {
  isLoading: boolean;
  errorMessage: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCheckboxModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  hidePassword = true;
   private stateSubject = new BehaviorSubject<LoginState>({
    isLoading: false,
    errorMessage: ''
  });
  state = this.stateSubject.asObservable();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

     this.stateSubject.next({ isLoading: true, errorMessage: '' });

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
         this.stateSubject.next({ isLoading: false, errorMessage: '' });
        this.router.navigate(['/dashboard']);
      },
      error: (error: HttpErrorResponse) => {
         let message = 'An error occurred. Please try again.';
        if (error.status === 401) {
          message = 'Invalid email or password';
        } else if (error.status === 0) {
          message = 'Cannot connect to server. Please try again.';
        } else {
          message = 'An error occurred. Please try again.';
        }

        this.stateSubject.next({ isLoading: false, errorMessage: message });
      }
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}