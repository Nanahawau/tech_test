import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BehaviorSubject } from 'rxjs';
import { DashboardService } from '../../services/dashboard.service';
import { AudienceSelectorComponent } from '../audience-selector/audience-selector.component';
import { LeadershipSummaryComponent } from '../leadership-summary/leadership-summary.component';
import { AccountManagerSummaryComponent } from '../account-manager-summary/account-manager-summary.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorPanelComponent } from '../../../../shared/components/error-panel/error-panel.component';
import {
  AccountManagerSummary,
  Audience,
  isAccountManagerSummary,
  isLeadershipSummary,
  LeadershipSummary,
  SummaryResponse,
} from '../../../../common/models/summary.model';

interface DashboardState {
  isLoading: boolean;
  error: string | null;
  summary: SummaryResponse | null;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    AudienceSelectorComponent,
    LeadershipSummaryComponent,
    AccountManagerSummaryComponent,
    LoadingSpinnerComponent,
    ErrorPanelComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  selectedAudience: Audience = 'leadership';

  private stateSubject = new BehaviorSubject<DashboardState>({
    isLoading: false,
    error: null,
    summary: null,
  });

  state$ = this.stateSubject.asObservable();

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadSummary();
  }

  onAudienceChange(audience: Audience): void {
    this.selectedAudience = audience;
    this.loadSummary();
  }

  loadSummary(): void {
    this.stateSubject.next({
      isLoading: true,
      error: null,
      summary: null,
    });

    this.dashboardService.getSummary(this.selectedAudience).subscribe({
      next: (data) => {
        this.stateSubject.next({
          isLoading: false,
          error: null,
          summary: data,
        });
      },
      error: (err) => {
        console.error('Failed to load summary:', err);
        this.stateSubject.next({
          isLoading: false,
          error: 'Failed to load dashboard data. Please try again.',
          summary: null,
        });
      },
    });
  }

  getLeadershipSummary(state: DashboardState): LeadershipSummary | null {
    if (!state.summary) return null;
    return isLeadershipSummary(state.summary) ? state.summary : null;
  }

  getAccountManagerSummary(state: DashboardState): AccountManagerSummary | null {
    if (!state.summary) return null;
    return isAccountManagerSummary(state.summary) ? state.summary : null;
  }
}
