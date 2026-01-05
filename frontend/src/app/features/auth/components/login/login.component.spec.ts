import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpErrorResponse } from '@angular/common/http';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../../common/services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: any;
  let router: any;

  beforeEach(async () => {
    authService = {
      login: vi.fn(),
    };

    router = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, NoopAnimationsModule],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize login form with empty fields', () => {
      expect(component.loginForm).toBeDefined();
      expect(component.loginForm.get('email')?.value).toBe('');
      expect(component.loginForm.get('password')?.value).toBe('');
    });

    it('should hide password by default', () => {
      expect(component.hidePassword).toBe(true);
    });

    it('should initialize with non-loading state', async () => {
      let state: any;
      component.state.subscribe((s) => (state = s));

      expect(state.isLoading).toBe(false);
      expect(state.errorMessage).toBe('');
    });
  });

  describe('Form Validation', () => {
    it('should invalidate empty form', () => {
      expect(component.loginForm.valid).toBe(false);
    });

    it('should require email field', () => {
      const email = component.loginForm.get('email');
      expect(email?.hasError('required')).toBe(true);

      email?.setValue('test@example.com');
      expect(email?.hasError('required')).toBe(false);
    });

    it('should validate email format', () => {
      const email = component.loginForm.get('email');

      email?.setValue('invalid-email');
      expect(email?.hasError('email')).toBe(true);

      email?.setValue('valid@example.com');
      expect(email?.hasError('email')).toBe(false);
    });

    it('should require password field', () => {
      const password = component.loginForm.get('password');
      expect(password?.hasError('required')).toBe(true);

      password?.setValue('password123');
      expect(password?.hasError('required')).toBe(false);
    });

    it('should validate form with correct inputs', () => {
      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(component.loginForm.valid).toBe(true);
    });
  });

  describe('Form Submission', () => {
    it('should not submit invalid form', () => {
      component.onSubmit();

      expect(authService.login).not.toHaveBeenCalled();
      expect(component.loginForm.get('email')?.touched).toBe(true);
      expect(component.loginForm.get('password')?.touched).toBe(true);
    });

    it('should submit valid form and navigate on success', async () => {
      authService.login.mockReturnValue(of({ token: 'fake-token' }));

      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
      });

      component.onSubmit();

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should set loading state during submission', async () => {
      authService.login.mockReturnValue(of({ token: 'fake-token' }));

      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
      });

      const statePromise = new Promise<boolean>((resolve) => {
        component.state.subscribe((state) => {
          if (state.isLoading) {
            resolve(state.isLoading);
          }
        });
      });

      component.onSubmit();

      const isLoading = await statePromise;
      expect(isLoading).toBe(true);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should handle 401 unauthorized error', async () => {
      const error = new HttpErrorResponse({
        error: 'Unauthorized',
        status: 401,
        statusText: 'Unauthorized',
      });

      authService.login.mockReturnValue(throwError(() => error));

      component.onSubmit();
      await new Promise((resolve) => setTimeout(resolve, 100));

      let errorState: any;
      component.state.subscribe((state) => {
        if (state.errorMessage) errorState = state;
      });

      expect(errorState.errorMessage).toBe('Invalid email or password');
      expect(errorState.isLoading).toBe(false);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should handle network error (status 0)', async () => {
      const error = new HttpErrorResponse({
        error: 'Network error',
        status: 0,
        statusText: 'Unknown Error',
      });

      authService.login.mockReturnValue(throwError(() => error));

      component.onSubmit();
      await new Promise((resolve) => setTimeout(resolve, 100));

      let errorState: any;
      component.state.subscribe((state) => {
        if (state.errorMessage) errorState = state;
      });

      expect(errorState.errorMessage).toBe('Cannot connect to server. Please try again.');
      expect(errorState.isLoading).toBe(false);
    });

    it('should handle generic server error', async () => {
      const error = new HttpErrorResponse({
        error: 'Internal Server Error',
        status: 500,
        statusText: 'Internal Server Error',
      });

      authService.login.mockReturnValue(throwError(() => error));

      component.onSubmit();
      await new Promise((resolve) => setTimeout(resolve, 100));

      let errorState: any;
      component.state.subscribe((state) => {
        if (state.errorMessage) errorState = state;
      });

      expect(errorState.errorMessage).toBe('An error occurred. Please try again.');
      expect(errorState.isLoading).toBe(false);
    });
  });

  describe('Form Getters', () => {
    it('should return email form control', () => {
      const emailControl = component.email;
      expect(emailControl).toBe(component.loginForm.get('email'));
    });

    it('should return password form control', () => {
      const passwordControl = component.password;
      expect(passwordControl).toBe(component.loginForm.get('password'));
    });
  });
});
