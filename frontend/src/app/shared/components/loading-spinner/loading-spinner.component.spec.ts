import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach } from 'vitest';
import { LoadingSpinnerComponent } from './loading-spinner.component';

describe('LoadingSpinnerComponent', () => {
  let component: LoadingSpinnerComponent;
  let fixture: ComponentFixture<LoadingSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingSpinnerComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default diameter of 50', () => {
    expect(component.diameter).toBe(50);
  });

  it('should have default message of "Loading..."', () => {
    expect(component.message).toBe('Loading...');
  });

  it('should accept custom diameter input', () => {
    component.diameter = 100;
    expect(component.diameter).toBe(100);
  });

  it('should accept custom message input', () => {
    component.message = 'Please wait...';
    expect(component.message).toBe('Please wait...');
  });
});
