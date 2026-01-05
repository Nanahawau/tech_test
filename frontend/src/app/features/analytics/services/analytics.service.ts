import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiSuccessResponse } from '../../../common/models/api-response.model';
import { environment } from '../../../environments/environment';
import { ChartData, UsageByStatusResponse } from '../../../common/models/analytics.model';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private apiUrl = `${environment.apiBaseUrl}/api/insights/analytics`;

  constructor(private http: HttpClient) {}

  // GET /api/insights/analytics/subscriptions-by-status
  getSubscriptionsByStatus(): Observable<ChartData> {
    return this.http
      .get<ApiSuccessResponse<ChartData>>(`${this.apiUrl}/subscriptions-by-status`)
      .pipe(map((response) => response.data));
  }

  // GET /api/insights/analytics/notifications-sent-vs-billed
  getNotificationsSentVsBilled(): Observable<ChartData> {
    return this.http
      .get<ApiSuccessResponse<ChartData>>(`${this.apiUrl}/notifications-sent-vs-billed`)
      .pipe(map((response) => response.data));
  }

  // GET /api/insights/analytics/workflows/top?limit=10
  getTopWorkflows(limit: number = 10): Observable<ChartData> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http
      .get<ApiSuccessResponse<ChartData>>(`${this.apiUrl}/workflows/top`, { params })
      .pipe(map((response) => response.data));
  }

  // GET /api/insights/analytics/usage/by-subscription-status
  getUsageByStatus(): Observable<UsageByStatusResponse> {
    return this.http
      .get<ApiSuccessResponse<UsageByStatusResponse>>(`${this.apiUrl}/usage/by-subscription-status`)
      .pipe(map((response) => response.data));
  }
}
