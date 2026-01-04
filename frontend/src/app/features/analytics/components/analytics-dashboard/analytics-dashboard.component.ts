import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

// ✅ CRITICAL: Register Chart.js components
import {
  Chart,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  DoughnutController,
  BarController,
  Tooltip,
  Legend
} from 'chart.js';

// Register all required Chart.js components
Chart.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  DoughnutController,
  BarController,
  Tooltip,
  Legend
);

import { AnalyticsService } from '../../services/analytics.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ChartData, UsageByStatusResponse } from '../../../../common/models/analytics.model';

interface AnalyticsState {
  subscriptionsByStatus: ChartData | null;
  notificationsSentVsBilled: ChartData | null;
  topWorkflows: ChartData | null;
  usageByStatus: UsageByStatusResponse | null;
  isLoading: boolean;
  error: string | null;
}

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    BaseChartDirective,
    LoadingSpinnerComponent
  ],
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.css']
})
export class AnalyticsDashboardComponent implements OnInit {
  private stateSubject = new BehaviorSubject<AnalyticsState>({
    subscriptionsByStatus: null,
    notificationsSentVsBilled: null,
    topWorkflows: null,
    usageByStatus: null,
    isLoading: false,
    error: null
  });

  state$ = this.stateSubject.asObservable();

  // Chart type definitions
  subscriptionsChartType: 'doughnut' = 'doughnut';
  notificationsChartType: 'bar' = 'bar';
  workflowsChartType: 'bar' = 'bar';

  // Chart configurations
  subscriptionsChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: []
  };

  subscriptionsChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true
      }
    }
  };

  notificationsChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  };

  notificationsChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  workflowsChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  };

  workflowsChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true
      }
    },
    scales: {
      x: {
        beginAtZero: true
      }
    }
  };

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.loadAllAnalytics();
  }

  loadAllAnalytics(): void {
    const currentState = this.stateSubject.value;

    this.stateSubject.next({
      ...currentState,
      isLoading: true,
      error: null
    });

    forkJoin({
      subscriptionsByStatus: this.analyticsService.getSubscriptionsByStatus(),
      notificationsSentVsBilled: this.analyticsService.getNotificationsSentVsBilled(),
      topWorkflows: this.analyticsService.getTopWorkflows(10),
      usageByStatus: this.analyticsService.getUsageByStatus()
    }).subscribe({
      next: (data) => {
        this.stateSubject.next({
          ...data,
          isLoading: false,
          error: null
        });
        this.updateCharts(data);
      },
      error: (error) => {
        console.error('❌ Failed to load analytics:', error);
        this.stateSubject.next({
          ...this.stateSubject.value,
          isLoading: false,
          error: 'Failed to load analytics. Please try again.'
        });
      }
    });
  }

  updateCharts(data: any): void {
    // Subscriptions by Status - Doughnut Chart
    if (data.subscriptionsByStatus) {
      this.subscriptionsChartData = {
        labels: data.subscriptionsByStatus.labels.map((l: string) => 
          l.charAt(0).toUpperCase() + l.slice(1)
        ),
        datasets: [{
          data: data.subscriptionsByStatus.values,
          backgroundColor: ['#10b981', '#6b7280'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      };
    }

    // Notifications Sent vs Billed - Bar Chart
    if (data.notificationsSentVsBilled) {
      this.notificationsChartData = {
        labels: data.notificationsSentVsBilled.labels.map((l: string) => 
          l.charAt(0).toUpperCase() + l.slice(1)
        ),
        datasets: [{
          data: data.notificationsSentVsBilled.values,
          backgroundColor: ['#6366f1', '#8b5cf6'],
          borderRadius: 8,
          barThickness: 60
        }]
      };
    }

    // Top Workflows - Horizontal Bar Chart
    if (data.topWorkflows) {
      this.workflowsChartData = {
        labels: data.topWorkflows.labels,
        datasets: [{
          data: data.topWorkflows.values,
          backgroundColor: '#6366f1',
          borderRadius: 4,
          barThickness: 25
        }]
      };
    }
  }

  getTotalAccounts(usage: UsageByStatusResponse | null): number {
    if (!usage) return 0;
    return usage.active.accounts + usage.inactive.accounts;
  }

  getTotalMessages(usage: UsageByStatusResponse | null): number {
    if (!usage) return 0;
    return usage.active.messages_processed_total + usage.inactive.messages_processed_total;
  }

  getTotalNotifications(usage: UsageByStatusResponse | null): number {
    if (!usage) return 0;
    return usage.active.notifications_sent_total + usage.inactive.notifications_sent_total;
  }

  getTotalRecords(usage: UsageByStatusResponse | null): number {
    if (!usage) return 0;
    return usage.active.total_records_total + usage.inactive.total_records_total;
  }

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  }
}