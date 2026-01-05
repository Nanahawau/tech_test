import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError, delay } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from '../../services/dashboard.service';
import {
  Audience,
  LeadershipSummary,
  AccountManagerSummary,
} from '../../../../common/models/summary.model';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let dashboardService: any;

  const mockLeadershipSummary: LeadershipSummary = {
    analytics: {
      accounts_total: 100,
      accounts_active: 80,
      accounts_inactive: 20,
      workflows_total: 500,
      workflow_titles_unique: 50,
      automation_count_total: 1000,
      messages_processed_total: 50000,
      notifications_sent_total: 45000,
      notifications_billed_total: 44000,
      notifications_billed_ratio: 0.98,
    },
  };

  const mockAccountManagerSummary: AccountManagerSummary = {
    analytics: {
      accounts_total: 50,
      inactive_with_usage_count: 5,
      active_zero_activity_count: 3,
      seats_vs_usage_mismatch_count: 2,
      billed_vs_sent_anomalies_count: 1,
    },
    action_lists: {
      inactive_with_usage: {
        reason: 'Inactive with usage',
        recommended_actions: ['Contact'],
        items: [],
      },
      active_zero_activity: {
        reason: 'Active but no activity',
        recommended_actions: ['Check'],
        items: [],
      },
      seats_vs_usage_mismatch: {
        reason: 'Seats mismatch',
        recommended_actions: ['Review'],
        items: [],
      },
      billed_vs_sent_anomalies: {
        reason: 'Billing anomaly',
        recommended_actions: ['Investigate'],
        items: [],
      },
    },
    notes: null,
  };

  beforeEach(async () => {
    dashboardService = {
      getSummary: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, NoopAnimationsModule],
      providers: [{ provide: DashboardService, useValue: dashboardService }],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with leadership audience', () => {
      expect(component.selectedAudience).toBe('leadership');
    });

    it('should initialize with default state', () => {
      let state: any;
      component.state$.subscribe((s) => (state = s));

      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.summary).toBeNull();
    });

    it('should load summary on init', () => {
      dashboardService.getSummary.mockReturnValue(of(mockLeadershipSummary));

      component.ngOnInit();

      expect(dashboardService.getSummary).toHaveBeenCalledWith('leadership');
    });
  });

  describe('Load Summary', () => {
    it('should set loading state when loading starts', async () => {
      // Use delay to keep the observable from completing immediately
      dashboardService.getSummary.mockReturnValue(of(mockLeadershipSummary).pipe(delay(10)));

      const states: any[] = [];
      component.state$.subscribe((s) => states.push(s));

      component.loadSummary();

      // Wait a tick for the first emission
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Check that at some point isLoading was true
      const loadingState = states.find((s) => s.isLoading === true);
      expect(loadingState).toBeDefined();
      expect(loadingState?.isLoading).toBe(true);
    });

    it('should load leadership summary successfully', async () => {
      dashboardService.getSummary.mockReturnValue(of(mockLeadershipSummary));

      component.loadSummary();

      await new Promise((resolve) => setTimeout(resolve, 50));

      let state: any;
      component.state$.subscribe((s) => (state = s));

      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.summary).toEqual(mockLeadershipSummary);
      expect(dashboardService.getSummary).toHaveBeenCalledWith('leadership');
    });

    it('should load account manager summary successfully', async () => {
      component.selectedAudience = 'account_manager';
      dashboardService.getSummary.mockReturnValue(of(mockAccountManagerSummary));

      component.loadSummary();

      await new Promise((resolve) => setTimeout(resolve, 50));

      let state: any;
      component.state$.subscribe((s) => (state = s));

      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.summary).toEqual(mockAccountManagerSummary);
      expect(dashboardService.getSummary).toHaveBeenCalledWith('account_manager');
    });

    it('should handle error when loading summary fails', async () => {
      const error = new Error('Network error');
      dashboardService.getSummary.mockReturnValue(throwError(() => error));

      component.loadSummary();

      await new Promise((resolve) => setTimeout(resolve, 50));

      let state: any;
      component.state$.subscribe((s) => (state = s));

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Failed to load dashboard data. Please try again.');
      expect(state.summary).toBeNull();
    });
  });

  describe('Audience Change', () => {
    it('should change to account_manager audience', () => {
      dashboardService.getSummary.mockReturnValue(of(mockAccountManagerSummary));

      component.onAudienceChange('account_manager');

      expect(component.selectedAudience).toBe('account_manager');
      expect(dashboardService.getSummary).toHaveBeenCalledWith('account_manager');
    });

    it('should change to leadership audience', () => {
      component.selectedAudience = 'account_manager';
      dashboardService.getSummary.mockReturnValue(of(mockLeadershipSummary));

      component.onAudienceChange('leadership');

      expect(component.selectedAudience).toBe('leadership');
      expect(dashboardService.getSummary).toHaveBeenCalledWith('leadership');
    });

    it('should reload summary when audience changes', () => {
      dashboardService.getSummary.mockReturnValue(of(mockLeadershipSummary));

      component.onAudienceChange('account_manager');

      expect(dashboardService.getSummary).toHaveBeenCalledTimes(1);

      component.onAudienceChange('leadership');

      expect(dashboardService.getSummary).toHaveBeenCalledTimes(2);
    });

    it('should set loading state when changing audience', async () => {
      dashboardService.getSummary.mockReturnValue(of(mockAccountManagerSummary).pipe(delay(10)));

      const states: any[] = [];
      component.state$.subscribe((s) => states.push(s));

      component.onAudienceChange('account_manager');

      await new Promise((resolve) => setTimeout(resolve, 0));

      const loadingState = states.find((s) => s.isLoading === true);
      expect(loadingState).toBeDefined();
      expect(loadingState?.isLoading).toBe(true);
    });
  });

  describe('Get Leadership Summary', () => {
    it('should return leadership summary when state contains leadership summary', async () => {
      dashboardService.getSummary.mockReturnValue(of(mockLeadershipSummary));
      component.loadSummary();

      await new Promise((resolve) => setTimeout(resolve, 50));

      let state: any;
      component.state$.subscribe((s) => (state = s));

      const result = component.getLeadershipSummary(state);

      expect(result).toEqual(mockLeadershipSummary);
    });

    it('should return null when state contains account manager summary', async () => {
      component.selectedAudience = 'account_manager';
      dashboardService.getSummary.mockReturnValue(of(mockAccountManagerSummary));
      component.loadSummary();

      await new Promise((resolve) => setTimeout(resolve, 50));

      let state: any;
      component.state$.subscribe((s) => (state = s));

      const result = component.getLeadershipSummary(state);

      expect(result).toBeNull();
    });

    it('should return null when state summary is null', () => {
      const state = {
        isLoading: false,
        error: null,
        summary: null,
      };

      const result = component.getLeadershipSummary(state);

      expect(result).toBeNull();
    });
  });

  describe('Get Account Manager Summary', () => {
    it('should return account manager summary when state contains account manager summary', async () => {
      component.selectedAudience = 'account_manager';
      dashboardService.getSummary.mockReturnValue(of(mockAccountManagerSummary));
      component.loadSummary();

      await new Promise((resolve) => setTimeout(resolve, 50));

      let state: any;
      component.state$.subscribe((s) => (state = s));

      const result = component.getAccountManagerSummary(state);

      expect(result).toEqual(mockAccountManagerSummary);
    });

    it('should return null when state contains leadership summary', async () => {
      dashboardService.getSummary.mockReturnValue(of(mockLeadershipSummary));
      component.loadSummary();

      await new Promise((resolve) => setTimeout(resolve, 50));

      let state: any;
      component.state$.subscribe((s) => (state = s));

      const result = component.getAccountManagerSummary(state);

      expect(result).toBeNull();
    });

    it('should return null when state summary is null', () => {
      const state = {
        isLoading: false,
        error: null,
        summary: null,
      };

      const result = component.getAccountManagerSummary(state);

      expect(result).toBeNull();
    });
  });

  describe('State Management', () => {
    it('should emit state changes through observable', async () => {
      dashboardService.getSummary.mockReturnValue(of(mockLeadershipSummary));

      const states: any[] = [];
      component.state$.subscribe((state) => states.push(state));

      component.loadSummary();

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(states.length).toBeGreaterThan(1);
      expect(states[states.length - 1].isLoading).toBe(false);
      expect(states[states.length - 1].summary).toEqual(mockLeadershipSummary);
    });

    it('should clear error when loading new summary', async () => {
      const error = new Error('Test error');
      dashboardService.getSummary.mockReturnValue(throwError(() => error));

      component.loadSummary();

      await new Promise((resolve) => setTimeout(resolve, 50));

      // Verify error was set
      let errorState: any;
      component.state$.subscribe((s) => (errorState = s));
      expect(errorState.error).toBe('Failed to load dashboard data. Please try again.');

      // Now load successfully
      dashboardService.getSummary.mockReturnValue(of(mockLeadershipSummary));

      component.loadSummary();

      // Wait for the new load to complete
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Now check that error is cleared
      let finalState: any;
      component.state$.subscribe((s) => (finalState = s));

      expect(finalState.error).toBeNull();
      expect(finalState.summary).toEqual(mockLeadershipSummary);
      expect(finalState.isLoading).toBe(false);
    });
  });
});
