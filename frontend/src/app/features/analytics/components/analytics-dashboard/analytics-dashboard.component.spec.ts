import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { AnalyticsDashboardComponent } from './analytics-dashboard.component';
import { AnalyticsService } from '../../services/analytics.service';
import { ChartData, UsageByStatusResponse } from '../../../../common/models/analytics.model';

describe('AnalyticsDashboardComponent', () => {
  let component: AnalyticsDashboardComponent;
  let analyticsService: any;

  const mockSubscriptionsByStatus: ChartData = {
    labels: ['active', 'inactive'],
    values: [75, 25],
  };

  const mockNotificationsSentVsBilled: ChartData = {
    labels: ['sent', 'billed'],
    values: [10000, 8500],
  };

  const mockTopWorkflows: ChartData = {
    labels: ['Workflow A', 'Workflow B', 'Workflow C'],
    values: [5000, 3000, 2000],
  };

  const mockUsageByStatus: UsageByStatusResponse = {
    active: {
      accounts: 50,
      automation_count_total: 100,
      messages_processed_total: 100000,
      notifications_sent_total: 85000,
      notifications_billed_total: 80000,
      total_records_total: 500000,
    },
    inactive: {
      accounts: 20,
      automation_count_total: 50,
      messages_processed_total: 30000,
      notifications_sent_total: 25000,
      notifications_billed_total: 20000,
      total_records_total: 150000,
    },
  };

  beforeEach(() => {
    analyticsService = {
      getSubscriptionsByStatus: vi.fn().mockReturnValue(of(mockSubscriptionsByStatus)),
      getNotificationsSentVsBilled: vi.fn().mockReturnValue(of(mockNotificationsSentVsBilled)),
      getTopWorkflows: vi.fn().mockReturnValue(of(mockTopWorkflows)),
      getUsageByStatus: vi.fn().mockReturnValue(of(mockUsageByStatus)),
    };

    // Create component instance without TestBed to avoid rendering
    component = new AnalyticsDashboardComponent(analyticsService);
  });

  it('should create and initialize chart types', () => {
    expect(component).toBeTruthy();
    expect(component.subscriptionsChartType).toBe('doughnut');
    expect(component.notificationsChartType).toBe('bar');
    expect(component.workflowsChartType).toBe('bar');
  });

  it('should load all analytics data on init', async () => {
    component.ngOnInit();
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(analyticsService.getSubscriptionsByStatus).toHaveBeenCalled();
    expect(analyticsService.getNotificationsSentVsBilled).toHaveBeenCalled();
    expect(analyticsService.getTopWorkflows).toHaveBeenCalledWith(10);
    expect(analyticsService.getUsageByStatus).toHaveBeenCalled();
  });

  it('should update state with analytics data on successful load', async () => {
    component.ngOnInit();
    await new Promise((resolve) => setTimeout(resolve, 100));

    let finalState: any;
    component.state$.subscribe((state) => {
      if (!state.isLoading && state.subscriptionsByStatus) {
        finalState = state;
      }
    });

    expect(finalState.subscriptionsByStatus).toEqual(mockSubscriptionsByStatus);
    expect(finalState.usageByStatus).toEqual(mockUsageByStatus);
    expect(finalState.isLoading).toBe(false);
    expect(finalState.error).toBeNull();
  });

  it('should handle API errors gracefully', async () => {
    analyticsService.getSubscriptionsByStatus.mockReturnValue(
      throwError(() => new Error('API Error')),
    );

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    component.ngOnInit();
    await new Promise((resolve) => setTimeout(resolve, 100));

    let errorState: any;
    component.state$.subscribe((state) => {
      if (state.error) errorState = state;
    });

    expect(errorState.error).toBe('Failed to load analytics. Please try again.');
    expect(errorState.isLoading).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('should update chart data correctly with capitalized labels', async () => {
    component.ngOnInit();
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(component.subscriptionsChartData.labels).toEqual(['Active', 'Inactive']);
    expect(component.subscriptionsChartData.datasets[0].data).toEqual([75, 25]);
    expect(component.notificationsChartData.labels).toEqual(['Sent', 'Billed']);
    expect(component.workflowsChartData.labels).toEqual(['Workflow A', 'Workflow B', 'Workflow C']);
  });

  it('should calculate usage statistics correctly', () => {
    expect(component.getTotalAccounts(mockUsageByStatus)).toBe(70);
    expect(component.getTotalMessages(mockUsageByStatus)).toBe(130000);
    expect(component.getTotalNotifications(mockUsageByStatus)).toBe(110000);
    expect(component.getTotalRecords(mockUsageByStatus)).toBe(650000);
  });

  it('should return 0 for null usage data', () => {
    expect(component.getTotalAccounts(null)).toBe(0);
    expect(component.getTotalMessages(null)).toBe(0);
    expect(component.getTotalNotifications(null)).toBe(0);
    expect(component.getTotalRecords(null)).toBe(0);
  });

  it('should format numbers correctly with K and M suffixes', () => {
    expect(component.formatNumber(999)).toBe('999');
    expect(component.formatNumber(1000)).toBe('1.0K');
    expect(component.formatNumber(1500)).toBe('1.5K');
    expect(component.formatNumber(25000)).toBe('25.0K');
    expect(component.formatNumber(1000000)).toBe('1.0M');
    expect(component.formatNumber(1500000)).toBe('1.5M');
  });

  it('should have responsive chart configurations', () => {
    expect(component.subscriptionsChartOptions?.responsive).toBe(true);
    expect(component.notificationsChartOptions?.responsive).toBe(true);
    expect(component.workflowsChartOptions?.responsive).toBe(true);
    expect(component.workflowsChartOptions?.indexAxis).toBe('y');
  });

  it('should allow manual reload of analytics', async () => {
    component.ngOnInit();
    await new Promise((resolve) => setTimeout(resolve, 100));

    vi.clearAllMocks();
    component.loadAllAnalytics();

    expect(analyticsService.getSubscriptionsByStatus).toHaveBeenCalled();
    expect(analyticsService.getNotificationsSentVsBilled).toHaveBeenCalled();
    expect(analyticsService.getTopWorkflows).toHaveBeenCalled();
    expect(analyticsService.getUsageByStatus).toHaveBeenCalled();
  });
});
