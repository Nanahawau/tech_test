import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { of, throwError } from 'rxjs';
import { IngestionPageComponent } from './ingestion-page.component';
import { IngestionService } from '../../services/ingestion.service';

describe('IngestionPageComponent', () => {
  let component: IngestionPageComponent;
  let fixture: ComponentFixture<IngestionPageComponent>;
  let ingestionService: any;
  let snackBar: any;
  let dialog: any;

  beforeEach(async () => {
    ingestionService = {
      uploadFile: vi.fn(),
      reloadData: vi.fn(),
    };

    snackBar = {
      open: vi.fn().mockReturnValue({
        onAction: vi.fn().mockReturnValue(of(undefined)),
        afterDismissed: vi.fn().mockReturnValue(of(undefined)),
      }),
    };

    dialog = {
      open: vi.fn().mockReturnValue({
        afterClosed: vi.fn().mockReturnValue(of(undefined)),
      }),
    };

    await TestBed.configureTestingModule({
      imports: [IngestionPageComponent, NoopAnimationsModule],
      providers: [
        { provide: IngestionService, useValue: ingestionService },
        { provide: MatSnackBar, useValue: snackBar },
        { provide: MatDialog, useValue: dialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(IngestionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default state', () => {
      let state: any;
      component.state$.subscribe((s) => (state = s));

      expect(state.isUploading).toBe(false);
      expect(state.isReloading).toBe(false);
      expect(state.uploadProgress).toBeNull();
      expect(state.lastResult).toBeNull();
      expect(state.error).toBeNull();
      expect(state.selectedFile).toBeNull();
    });

    it('should initialize with accepted file types', () => {
      expect(component.acceptedTypes).toEqual(['.csv']);
    });

    it('should not be dragging by default', () => {
      expect(component.isDragging).toBe(false);
    });
  });

  describe('File Selection', () => {
    it('should select valid CSV file', () => {
      const file = new File(['test'], 'test.csv', { type: 'text/csv' });
      component.selectFile(file);

      let state: any;
      component.state$.subscribe((s) => (state = s));

      expect(state.selectedFile).toBe(file);
    });

    it('should reject invalid file type', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      component.selectFile(file);

      let state: any;
      component.state$.subscribe((s) => (state = s));
      expect(state.selectedFile).toBeNull();
    });

    it('should reject file larger than 50MB', () => {
      const largeSize = 51 * 1024 * 1024;
      const file = new File(['x'], 'large.csv', { type: 'text/csv' });
      Object.defineProperty(file, 'size', { value: largeSize, writable: false });

      component.selectFile(file);

      let state: any;
      component.state$.subscribe((s) => (state = s));
      expect(state.selectedFile).toBeNull();
    });

    it('should handle file input change event', () => {
      const file = new File(['test'], 'test.csv', { type: 'text/csv' });
      const event = {
        target: { files: [file] },
      } as any;

      component.onFileSelected(event);

      let state: any;
      component.state$.subscribe((s) => (state = s));
      expect(state.selectedFile).toBe(file);
    });

    it('should remove selected file', () => {
      const file = new File(['test'], 'test.csv', { type: 'text/csv' });
      component.selectFile(file);

      component.removeFile();

      let state: any;
      component.state$.subscribe((s) => (state = s));
      expect(state.selectedFile).toBeNull();
    });
  });

  describe('Drag and Drop', () => {
    it('should set dragging to true on drag over', () => {
      const event = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as any;

      component.onDragOver(event);

      expect(component.isDragging).toBe(true);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should set dragging to false on drag leave', () => {
      component.isDragging = true;
      const event = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as any;

      component.onDragLeave(event);

      expect(component.isDragging).toBe(false);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should handle file drop', () => {
      const file = new File(['test'], 'test.csv', { type: 'text/csv' });
      const event = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        dataTransfer: { files: [file] },
      } as any;

      component.onDrop(event);

      expect(component.isDragging).toBe(false);
      expect(event.preventDefault).toHaveBeenCalled();

      let state: any;
      component.state$.subscribe((s) => (state = s));
      expect(state.selectedFile).toBe(file);
    });
  });

  describe('File Upload', () => {
    it('should not upload when no file is selected', () => {
      component.uploadFile();

      expect(ingestionService.uploadFile).not.toHaveBeenCalled();

      let state: any;
      component.state$.subscribe((s) => (state = s));
      expect(state.isUploading).toBe(false);
    });

    it('should set uploading state when upload starts', () => {
      const file = new File(['test'], 'test.csv', { type: 'text/csv' });
      component.selectFile(file);

      ingestionService.uploadFile.mockReturnValue(
        of({ progress: 50, status: 'uploading', message: 'Uploading...' }),
      );

      let state: any;
      component.state$.subscribe((s) => (state = s));

      component.uploadFile();

      expect(ingestionService.uploadFile).toHaveBeenCalledWith(file);
      expect(state.isUploading).toBe(true);
    });

    it('should call ingestion service with selected file', () => {
      const file = new File(['test'], 'test.csv', { type: 'text/csv' });
      component.selectFile(file);

      ingestionService.uploadFile.mockReturnValue(
        of({ progress: 100, status: 'complete', message: 'Complete!' }),
      );

      component.uploadFile();

      expect(ingestionService.uploadFile).toHaveBeenCalledWith(file);
    });

    it('should handle upload errors', async () => {
      const file = new File(['test'], 'test.csv', { type: 'text/csv' });
      component.selectFile(file);

      const error = new HttpErrorResponse({
        status: 500,
        error: { error: { message: 'Server error' } },
      });

      ingestionService.uploadFile.mockReturnValue(throwError(() => error));

      component.uploadFile();

      await new Promise((resolve) => setTimeout(resolve, 50));

      let state: any;
      component.state$.subscribe((s) => (state = s));
      expect(state.isUploading).toBe(false);
    });
  });

  describe('Data Reload', () => {
    it('should call reload service', () => {
      const mockResult = {
        success: true,
        message: 'Data reloaded',
      };

      ingestionService.reloadData.mockReturnValue(of(mockResult));

      component.reloadData();

      expect(ingestionService.reloadData).toHaveBeenCalled();
    });

    it('should set reloading state', async () => {
      const mockResult = {
        success: true,
        message: 'Data reloaded',
      };

      ingestionService.reloadData.mockReturnValue(of(mockResult));

      component.reloadData();

      // Wait a tick for the observable to emit
      await new Promise((resolve) => setTimeout(resolve, 0));

      let state: any;
      component.state$.subscribe((s) => (state = s));

      // After reload completes, isReloading should be false
      expect(state.isReloading).toBe(false);
      expect(state.lastResult).toEqual(mockResult);
    });

    it('should handle reload errors', async () => {
      const error = new HttpErrorResponse({
        status: 500,
        error: { detail: 'Reload failed' },
      });

      ingestionService.reloadData.mockReturnValue(throwError(() => error));

      component.reloadData();

      await new Promise((resolve) => setTimeout(resolve, 50));

      let state: any;
      component.state$.subscribe((s) => (state = s));
      expect(state.isReloading).toBe(false);
    });
  });

  describe('Utility Functions', () => {
    it('should format file size correctly', () => {
      expect(component.formatFileSize(0)).toBe('0 Bytes');
      expect(component.formatFileSize(1024)).toBe('1 KB');
      expect(component.formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(component.formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
      expect(component.formatFileSize(1536)).toBe('1.5 KB');
    });
  });
});
