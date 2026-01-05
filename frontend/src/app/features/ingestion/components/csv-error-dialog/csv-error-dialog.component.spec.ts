import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CsvErrorDialogComponent } from './csv-error-dialog.component';

describe('CsvErrorDialogComponent', () => {
  let component: CsvErrorDialogComponent;
  let fixture: ComponentFixture<CsvErrorDialogComponent>;
  let dialogRef: any;

  const mockDialogData = {
    message: 'CSV validation failed',
    expected: ['id', 'name', 'email'],
    missing: ['email'],
    extra: ['phone'],
    headersPresent: ['id', 'name', 'phone'],
  };

  beforeEach(async () => {
    dialogRef = {
      close: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [CsvErrorDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { ...mockDialogData } }, // Create a copy
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CsvErrorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should receive dialog data', () => {
    expect(component.data.message).toBe('CSV validation failed');
    expect(component.data.expected).toEqual(['id', 'name', 'email']);
    expect(component.data.missing).toEqual(['email']);
  });

  it('should close dialog when close is called', () => {
    component.close();
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('should display error message', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('CSV validation failed');
  });

  it('should display missing headers', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('email');
  });

  it('should display extra headers', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('phone');
  });

  it('should display expected headers', () => {
    const compiled = fixture.nativeElement;
    const text = compiled.textContent;
    expect(text).toContain('id');
    expect(text).toContain('name');
  });

  it('should handle empty missing headers', async () => {
    // Reconfigure TestBed with new data
    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [CsvErrorDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            message: 'Test message',
            expected: ['id'],
            missing: [],
            extra: [],
            headersPresent: ['id'],
          },
        },
      ],
    }).compileComponents();

    const newFixture = TestBed.createComponent(CsvErrorDialogComponent);
    const newComponent = newFixture.componentInstance;
    newFixture.detectChanges();

    expect(newComponent.data.missing).toEqual([]);
    expect(newComponent.data.extra).toEqual([]);
  });

  it('should handle multiple missing headers', async () => {
    // Reconfigure TestBed with new data
    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [CsvErrorDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            message: 'Multiple missing headers',
            expected: ['id', 'name', 'email', 'phone', 'address'],
            missing: ['email', 'phone', 'address'],
            extra: [],
            headersPresent: ['id', 'name'],
          },
        },
      ],
    }).compileComponents();

    const newFixture = TestBed.createComponent(CsvErrorDialogComponent);
    const newComponent = newFixture.componentInstance;
    newFixture.detectChanges();

    expect(newComponent.data.missing.length).toBe(3);
    expect(newComponent.data.missing).toContain('email');
    expect(newComponent.data.missing).toContain('phone');
    expect(newComponent.data.missing).toContain('address');
  });
});
