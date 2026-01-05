import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiSuccessResponse } from '../../../common/models/api-response.model';
import { environment } from '../../../environments/environment';
import {
  AccountManagerSummary,
  Audience,
  LeadershipSummary,
  SummaryResponse,
} from '../../../common/models/summary.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrl = `${environment.apiBaseUrl}/api/insights`;

  constructor(private http: HttpClient) {}

  getSummary(audience: Audience): Observable<SummaryResponse> {
    return this.http
      .get<ApiSuccessResponse<SummaryResponse>>(`${this.apiUrl}/summary`, { params: { audience } })
      .pipe(map((response) => response.data));
  }

  getLeadershipSummary(): Observable<LeadershipSummary> {
    return this.getSummary('leadership') as Observable<LeadershipSummary>;
  }

  getAccountManagerSummary(): Observable<AccountManagerSummary> {
    return this.getSummary('account_manager') as Observable<AccountManagerSummary>;
  }
}
