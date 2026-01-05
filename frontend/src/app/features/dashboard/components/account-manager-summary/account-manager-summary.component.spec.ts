import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { AccountManagerSummaryComponent } from './account-manager-summary.component';
import { AccountManagerSummary } from '../../../../common/models/summary.model';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('AccountManagerSummaryComponent', () => {
  let component: AccountManagerSummaryComponent;
  let fixture: ComponentFixture<AccountManagerSummaryComponent>;

  const mockSummary: AccountManagerSummary = {
    analytics: {
      accounts_total: 50,
      inactive_with_usage_count: 5,
      active_zero_activity_count: 3,
      seats_vs_usage_mismatch_count: 2,
      billed_vs_sent_anomalies_count: 1,
    },
    action_lists: {
      inactive_with_usage: {
        reason: 'These accounts are inactive but showing usage',
        recommended_actions: ['Contact account', 'Verify status'],
        items: [
          { account_uuid: 'uuid-1', account_label: 'Account 1' },
          { account_uuid: 'uuid-2', account_label: 'Account 2' },
        ],
      },
      active_zero_activity: {
        reason: 'These accounts are active but have no activity',
        recommended_actions: ['Check configuration'],
        items: [{ account_uuid: 'uuid-3', account_label: 'Account 3' }],
      },
      seats_vs_usage_mismatch: {
        reason: 'Seat allocation does not match usage',
        recommended_actions: ['Review seats'],
        items: [],
      },
      billed_vs_sent_anomalies: {
        reason: 'Billed notifications differ from sent',
        recommended_actions: ['Investigate billing'],
        items: [],
      },
    },
    notes: ['Note 1', 'Note 2'],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountManagerSummaryComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountManagerSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with null summary', () => {
      expect(component._summary).toBeNull();
      expect(component.stats).toEqual([]);
    });
  });

  describe('Summary Input', () => {
    it('should set summary and build stats', () => {
      component.summary = mockSummary;

      expect(component._summary).toEqual(mockSummary);
      expect(component.stats).toHaveLength(4);
    });

    it('should not build stats when summary is null', () => {
      component.summary = null;

      expect(component._summary).toBeNull();
      expect(component.stats).toEqual([]);
    });

    it('should rebuild stats when summary changes', () => {
      component.summary = mockSummary;
      const firstStats = [...component.stats];

      const updatedSummary: AccountManagerSummary = {
        ...mockSummary,
        analytics: {
          ...mockSummary.analytics,
          accounts_total: 100,
        },
      };

      component.summary = updatedSummary;

      expect(component.stats).not.toEqual(firstStats);
      expect(component.stats[0].value).toBe('100');
    });
  });

  describe('Stats Building', () => {
    beforeEach(() => {
      component.summary = mockSummary;
    });

    it('should build correct total accounts stat', () => {
      const totalAccountsStat = component.stats[0];

      expect(totalAccountsStat.label).toBe('Total Accounts');
      expect(totalAccountsStat.value).toBe('50');
      expect(totalAccountsStat.subtitle).toBe('Under management');
      expect(totalAccountsStat.icon).toBe('business');
      expect(totalAccountsStat.iconColor).toBe('text-indigo-600');
    });

    it('should calculate total issues correctly', () => {
      const issuesStat = component.stats[1];

      expect(issuesStat.label).toBe('Accounts Needing Attention');
      expect(issuesStat.value).toBe('11'); // 5 + 3 + 2 + 1
      expect(issuesStat.subtitle).toBe('Require action');
      expect(issuesStat.icon).toBe('warning');
      expect(issuesStat.iconColor).toBe('text-orange-600');
    });

    it('should show healthy state when no issues', () => {
      const healthySummary: AccountManagerSummary = {
        ...mockSummary,
        analytics: {
          accounts_total: 50,
          inactive_with_usage_count: 0,
          active_zero_activity_count: 0,
          seats_vs_usage_mismatch_count: 0,
          billed_vs_sent_anomalies_count: 0,
        },
      };

      component.summary = healthySummary;
      const issuesStat = component.stats[1];

      expect(issuesStat.value).toBe('0');
      expect(issuesStat.subtitle).toBe('All healthy!');
      expect(issuesStat.icon).toBe('check_circle');
      expect(issuesStat.iconColor).toBe('text-green-600');
    });

    it('should build inactive with usage stat', () => {
      const inactiveWithUsageStat = component.stats[2];

      expect(inactiveWithUsageStat.label).toBe('Inactive with Usage');
      expect(inactiveWithUsageStat.value).toBe('5');
      expect(inactiveWithUsageStat.subtitle).toBe('Subscription inactive');
      expect(inactiveWithUsageStat.icon).toBe('pause_circle');
      expect(inactiveWithUsageStat.iconColor).toBe('text-orange-600');
    });

    it('should build active zero activity stat', () => {
      const activeZeroActivityStat = component.stats[3];

      expect(activeZeroActivityStat.label).toBe('Active Zero Activity');
      expect(activeZeroActivityStat.value).toBe('3');
      expect(activeZeroActivityStat.subtitle).toBe('No measured activity');
      expect(activeZeroActivityStat.icon).toBe('hourglass_empty');
      expect(activeZeroActivityStat.iconColor).toBe('text-amber-600');
    });

    it('should format large numbers correctly', () => {
      const largeSummary: AccountManagerSummary = {
        ...mockSummary,
        analytics: {
          accounts_total: 1500,
          inactive_with_usage_count: 250,
          active_zero_activity_count: 100,
          seats_vs_usage_mismatch_count: 75,
          billed_vs_sent_anomalies_count: 50,
        },
      };

      component.summary = largeSummary;

      expect(component.stats[0].value).toBe('1,500');
      expect(component.stats[1].value).toBe('475'); // 250 + 100 + 75 + 50
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero values', () => {
      const zeroSummary: AccountManagerSummary = {
        ...mockSummary,
        analytics: {
          accounts_total: 0,
          inactive_with_usage_count: 0,
          active_zero_activity_count: 0,
          seats_vs_usage_mismatch_count: 0,
          billed_vs_sent_anomalies_count: 0,
        },
      };

      component.summary = zeroSummary;

      expect(component.stats[0].value).toBe('0');
      expect(component.stats[1].value).toBe('0');
      expect(component.stats[1].subtitle).toBe('All healthy!');
    });

    it('should handle very large numbers', () => {
      const largeSummary: AccountManagerSummary = {
        ...mockSummary,
        analytics: {
          accounts_total: 1000000,
          inactive_with_usage_count: 100000,
          active_zero_activity_count: 50000,
          seats_vs_usage_mismatch_count: 25000,
          billed_vs_sent_anomalies_count: 10000,
        },
      };

      component.summary = largeSummary;

      expect(component.stats[0].value).toBe('1,000,000');
      expect(component.stats[1].value).toBe('185,000');
    });

    it('should handle summary with null notes', () => {
      const summaryWithNullNotes: AccountManagerSummary = {
        ...mockSummary,
        notes: null,
      };

      component.summary = summaryWithNullNotes;

      expect(component._summary?.notes).toBeNull();
      expect(component.stats).toHaveLength(4);
    });

    it('should handle summary without notes property', () => {
      const summaryWithoutNotes: AccountManagerSummary = {
        ...mockSummary,
      };
      delete summaryWithoutNotes.notes;

      component.summary = summaryWithoutNotes;

      expect(component._summary).toBeDefined();
      expect(component.stats).toHaveLength(4);
    });
  });

  describe('Stats Array Structure', () => {
    beforeEach(() => {
      component.summary = mockSummary;
    });

    it('should always have exactly 4 stats', () => {
      expect(component.stats).toHaveLength(4);
    });

    it('should have all required properties for each stat', () => {
      component.stats.forEach((stat) => {
        expect(stat).toHaveProperty('label');
        expect(stat).toHaveProperty('value');
        expect(stat).toHaveProperty('subtitle');
        expect(stat).toHaveProperty('icon');
        expect(stat).toHaveProperty('iconColor');
      });
    });

    it('should have string values for all stats', () => {
      component.stats.forEach((stat) => {
        expect(typeof stat.value).toBe('string');
        expect(typeof stat.label).toBe('string');
        expect(typeof stat.subtitle).toBe('string');
        expect(typeof stat.icon).toBe('string');
        expect(typeof stat.iconColor).toBe('string');
      });
    });
  });
});
