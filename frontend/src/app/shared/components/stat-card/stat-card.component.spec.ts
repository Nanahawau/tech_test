import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, it, expect, beforeEach } from 'vitest';
import { StatCardComponent } from './stat-card.component';
import { By } from '@angular/platform-browser';

describe('StatCardComponent', () => {
  let component: StatCardComponent;
  let fixture: ComponentFixture<StatCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatCardComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(StatCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default empty label', () => {
    expect(component.label).toBe('');
  });

  it('should have default value of 0', () => {
    expect(component.value).toBe(0);
  });

  it('should accept numeric value', () => {
    const customFixture = TestBed.createComponent(StatCardComponent);
    const customComponent = customFixture.componentInstance;
    customComponent.value = 1234;
    customFixture.detectChanges();

    expect(customComponent.value).toBe(1234);
  });

  it('should accept string value', () => {
    const customFixture = TestBed.createComponent(StatCardComponent);
    const customComponent = customFixture.componentInstance;
    customComponent.value = '1,234';
    customFixture.detectChanges();

    expect(customComponent.value).toBe('1,234');
  });

  it('should render mat-card', () => {
    const card = fixture.debugElement.query(By.css('mat-card'));
    expect(card).toBeTruthy();
  });
});
