import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { IngestionService, UploadProgress } from '../../services/ingestion.service';
import { IngestionResult } from '../../../../common/models/ingestion.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CsvErrorDialogComponent } from '../csv-error-dialog/csv-error-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';

interface IngestionState {
  isUploading: boolean;
  isReloading: boolean;
  uploadProgress: UploadProgress | null;
  lastResult: IngestionResult | null;
  error: string | null;
  selectedFile: File | null;
}

@Component({
  selector: 'app-ingestion-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatCardModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './ingestion-page.component.html',
  styleUrls: ['./ingestion-page.component.css']
})
export class IngestionPageComponent {
  private stateSubject = new BehaviorSubject<IngestionState>({
    isUploading: false,
    isReloading: false,
    uploadProgress: null,
    lastResult: null,
    error: null,
    selectedFile: null
  });

  state$ = this.stateSubject.asObservable();
  isDragging = false;

  // Accepted file types
  acceptedTypes = ['.csv'];

  constructor(
    private ingestionService: IngestionService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.selectFile(event.dataTransfer.files[0]);
    }
  }

  selectFile(file: File): void {
    const currentState = this.stateSubject.value;

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!this.acceptedTypes.includes(fileExtension)) {
      this.snackBar.open(
        `Invalid file type. Please upload: ${this.acceptedTypes.join(', ')}`,
        'Close',
        { duration: 5000 }
      );
      return;
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      this.snackBar.open(
        'File is too large. Maximum size is 50MB.',
        'Close',
        { duration: 5000 }
      );
      return;
    }

    this.stateSubject.next({
      ...currentState,
      selectedFile: file
    });
  }

  uploadFile(): void {
    const currentState = this.stateSubject.value;

    if (!currentState.selectedFile) {
      this.snackBar.open('Please select a file first', 'Close', { duration: 3000 });
      return;
    }

    this.stateSubject.next({
      ...currentState,
      isUploading: true,
      error: null,
      uploadProgress: { progress: 0, status: 'uploading', message: 'Starting upload...' }
    });

    this.ingestionService.uploadFile(currentState.selectedFile).subscribe({
      next: (progress) => {
        const state = this.stateSubject.value;
        this.stateSubject.next({
          ...state,
          uploadProgress: progress,
          isUploading: progress.status !== 'complete'
        });

        if (progress.status === 'complete') {
          this.snackBar.open('File uploaded successfully!', 'Close', { duration: 3000 });
          // Reset selected file after successful upload
          this.stateSubject.next({
            ...this.stateSubject.value,
            selectedFile: null
          });
        }
      },
      error: (error: HttpErrorResponse) => {
        this.stateSubject.next({
          ...this.stateSubject.value,
          isUploading: false,
          uploadProgress: null
        });
        if (error.status === 422 && error.error?.error?.details) {
          this.showCsvErrorDialog(error.error?.error?.details);
        } else {
          const errorMessage = error.error?.error?.message || 'Failed to upload file. Please try again.';
          this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
        }
      }
    });
  }

  private showCsvErrorDialog(errorDetails: any): void {
    this.dialog.open(CsvErrorDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: {
        message: errorDetails.message || 'CSV validation failed',
        expected: errorDetails.expected || [],
        missing: errorDetails.missing || [],
        extra: errorDetails.extra || [],
        headersPresent: errorDetails.headers_present || []
      }
    });
  }

  reloadData(): void {
    const currentState = this.stateSubject.value;

    this.stateSubject.next({
      ...currentState,
      isReloading: true,
    });

    this.ingestionService.reloadData().subscribe({
      next: (result) => {
        this.stateSubject.next({
          ...this.stateSubject.value,
          isReloading: false,
          lastResult: result
        });
        this.snackBar.open('Data reloaded successfully!', 'Close', { duration: 3000 });
      },
      error: (error: HttpErrorResponse) => {
        const errorMessage = error.error?.detail || 'Failed to reload data. Please try again.';
        this.stateSubject.next({
          ...this.stateSubject.value,
          isReloading: false,
        });
        this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
      }
    });
  }

  removeFile(): void {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({
      ...currentState,
      selectedFile: null,
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}