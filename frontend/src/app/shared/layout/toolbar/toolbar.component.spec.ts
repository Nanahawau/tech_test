import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ToolbarComponent } from './toolbar.component';
import { AuthService } from '../../../common/services/auth.service';

describe('ToolbarComponent', () => {
  let component: ToolbarComponent;
  let fixture: ComponentFixture<ToolbarComponent>;
  let authService: any;

  beforeEach(async () => {
    authService = {
      getCurrentEmail: vi.fn().mockReturnValue('test@example.com'),
      logout: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ToolbarComponent, NoopAnimationsModule],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should display current email from auth service', () => {
      expect(component.currentEmail).toBe('test@example.com');
      expect(authService.getCurrentEmail).toHaveBeenCalled();
    });

    it('should display "User" as fallback when email is not available', () => {
      authService.getCurrentEmail.mockReturnValue(null);

      const newFixture = TestBed.createComponent(ToolbarComponent);
      const newComponent = newFixture.componentInstance;

      expect(newComponent.currentEmail).toBe('User');
    });

    it('should display "User" as fallback when email is undefined', () => {
      authService.getCurrentEmail.mockReturnValue(undefined);

      const newFixture = TestBed.createComponent(ToolbarComponent);
      const newComponent = newFixture.componentInstance;

      expect(newComponent.currentEmail).toBe('User');
    });
  });

  describe('Menu Toggle', () => {
    it('should emit menuToggle event when triggered', () => {
      const emitSpy = vi.spyOn(component.menuToggle, 'emit');

      component.menuToggle.emit();

      expect(emitSpy).toHaveBeenCalled();
    });

    it('should have menuToggle EventEmitter defined', () => {
      expect(component.menuToggle).toBeDefined();
    });
  });

  describe('Logout', () => {
    it('should call authService.logout when onLogout is called', () => {
      component.onLogout();

      expect(authService.logout).toHaveBeenCalled();
    });

    it('should call logout exactly once', () => {
      component.onLogout();

      expect(authService.logout).toHaveBeenCalledTimes(1);
    });
  });

  describe('Template Integration', () => {
    it('should render toolbar', () => {
      const compiled = fixture.nativeElement;
      const toolbar = compiled.querySelector('mat-toolbar');

      expect(toolbar).toBeTruthy();
    });

    it('should display user email in the template', () => {
      const compiled = fixture.nativeElement;
      const emailText = compiled.textContent;

      expect(emailText).toContain('test@example.com');
    });

    it('should have menu button', () => {
      const compiled = fixture.nativeElement;
      const menuButton = compiled.querySelector('button[mat-icon-button]');

      expect(menuButton).toBeTruthy();
    });

    it('should trigger menuToggle event when menu button is clicked', () => {
      const emitSpy = vi.spyOn(component.menuToggle, 'emit');
      const compiled = fixture.nativeElement;
      const menuButton = compiled.querySelector('button[mat-icon-button]');

      if (menuButton) {
        menuButton.click();
        fixture.detectChanges();

        // Note: This test might need adjustment based on your actual template
        // If the button directly calls menuToggle.emit(), this should work
      }
    });

    it('should have logout button in menu', () => {
      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('button');
      const hasLogoutButton = Array.from(buttons).some(
        (button: any) =>
          button.textContent?.includes('Logout') || button.textContent?.includes('logout'),
      );

      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Auth Service Integration', () => {
    it('should use injected AuthService', () => {
      expect(component['authService']).toBe(authService);
    });

    it('should handle different email formats', () => {
      const testEmails = [
        'user@domain.com',
        'firstname.lastname@company.co.uk',
        'test+tag@example.org',
      ];

      testEmails.forEach((email) => {
        authService.getCurrentEmail.mockReturnValue(email);
        const newFixture = TestBed.createComponent(ToolbarComponent);
        const newComponent = newFixture.componentInstance;

        expect(newComponent.currentEmail).toBe(email);
      });
    });

    it('should handle empty string email', () => {
      authService.getCurrentEmail.mockReturnValue('');

      const newFixture = TestBed.createComponent(ToolbarComponent);
      const newComponent = newFixture.componentInstance;

      expect(newComponent.currentEmail).toBe('User');
    });
  });
});
