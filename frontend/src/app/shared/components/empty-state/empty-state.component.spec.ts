import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, it, expect, beforeEach } from 'vitest';
import { EmptyStateComponent } from './empty-state.component';
import { By } from '@angular/platform-browser';

describe('EmptyStateComponent', () => {
  let component: EmptyStateComponent;
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default icon value', () => {
    expect(component.icon).toBe('inbox');
  });

  it('should have default title value', () => {
    expect(component.title).toBe('No data available');
  });

  it('should accept custom icon input', () => {
    // Create new component instance with custom value
    const customFixture = TestBed.createComponent(EmptyStateComponent);
    const customComponent = customFixture.componentInstance;
    customComponent.icon = 'search';
    customFixture.detectChanges();

    expect(customComponent.icon).toBe('search');
  });

  it('should accept custom title input', () => {
    const customFixture = TestBed.createComponent(EmptyStateComponent);
    const customComponent = customFixture.componentInstance;
    customComponent.title = 'No results found';
    customFixture.detectChanges();

    expect(customComponent.title).toBe('No results found');
  });
});
