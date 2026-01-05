import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiSuccessResponse } from '../../../common/models/api-response.model';
import { environment } from '../../../environments/environment';
import { IngestionResult } from '../../../common/models/ingestion.model';

export interface UploadProgress {
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class IngestionService {
  private apiUrl = `${environment.apiBaseUrl}/api/ingest`;

  constructor(private http: HttpClient) {}

  uploadFile(file: File): Observable<UploadProgress> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http
      .post<ApiSuccessResponse<IngestionResult>>(this.apiUrl, formData, {
        reportProgress: true,
        observe: 'events',
      })
      .pipe(map((event) => this.getProgress(event)));
  }

  reloadData(): Observable<IngestionResult> {
    return this.http
      .post<ApiSuccessResponse<IngestionResult>>(`${this.apiUrl}/reload`, {})
      .pipe(map((response) => response.data));
  }

  private getProgress(event: HttpEvent<any>): UploadProgress {
    switch (event.type) {
      case HttpEventType.Sent:
        return { progress: 0, status: 'uploading', message: 'Upload started...' };

      case HttpEventType.UploadProgress:
        const percentDone = event.total ? Math.round((100 * event.loaded) / event.total) : 0;
        return {
          progress: percentDone,
          status: 'uploading',
          message: `Uploading: ${percentDone}%`,
        };

      case HttpEventType.Response:
        return {
          progress: 100,
          status: 'complete',
          message: 'Upload complete!',
        };

      default:
        return { progress: 0, status: 'uploading' };
    }
  }
}
