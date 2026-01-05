import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface CsvErrorData {
  message: string;
  expected: string[];
  missing: string[];
  extra: string[];
  headersPresent: string[];
}

@Component({
  selector: 'app-csv-error-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './csv-error-dialog.component.html',
  styleUrls: ['./csv-error-dialog.component.css'],
})
export class CsvErrorDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CsvErrorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CsvErrorData,
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text);
  }
}
