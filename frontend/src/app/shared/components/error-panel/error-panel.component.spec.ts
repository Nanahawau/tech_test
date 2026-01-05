import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ErrorPanelComponent } from './error-panel.component';
import { By } from '@angular/platform-browser';

describe('ErrorPanelComponent', () => {
  let component: ErrorPanelComponent;
  let fixture: ComponentFixture<ErrorPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorPanelComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default title', () => {
    expect(component.title).toBe('Error');
  });

  it('should have default message', () => {
    expect(component.message).toBe('An error occurred while loading data.');
  });

  it('should show retry button by default', () => {
    expect(component.showRetry).toBe(true);
  });

  it('should emit retry event when triggered', () => {
    const emitSpy = vi.spyOn(component.retry, 'emit');

    component.retry.emit();

    expect(emitSpy).toHaveBeenCalled();
  });

  it('should accept custom title input', () => {
    const customFixture = TestBed.createComponent(ErrorPanelComponent);
    const customComponent = customFixture.componentInstance;
    customComponent.title = 'Custom Error';
    customFixture.detectChanges();

    expect(customComponent.title).toBe('Custom Error');
  });

  it('should render error icon in template', () => {
    const icon = fixture.debugElement.query(By.css('mat-icon'));
    expect(icon).toBeTruthy();
    expect(icon.nativeElement.textContent?.trim()).toBe('error');
  });
});
