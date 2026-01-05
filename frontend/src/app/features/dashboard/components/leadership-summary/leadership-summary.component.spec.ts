import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { LeadershipSummaryComponent } from './leadership-summary.component';
import { LeadershipSummary } from '../../../../common/models/summary.model';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('LeadershipSummaryComponent', () => {
  let component: LeadershipSummaryComponent;
  let fixture: ComponentFixture<LeadershipSummaryComponent>;

  const mockSummary: LeadershipSummary = {
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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeadershipSummaryComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(LeadershipSummaryComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with empty stats array', () => {
      expect(component.stats).toEqual([]);
    });
  });

  describe('Summary Input and Stats Building', () => {
    it('should build stats when summary is provided', () => {
      component.summary = mockSummary;

      expect(component.stats).toHaveLength(9);
    });

    it('should not build stats when summary is null', () => {
      component.summary = null;

      expect(component.stats).toEqual([]);
    });

    it('should rebuild stats when summary changes', () => {
      component.summary = mockSummary;
      const firstStatsLength = component.stats.length;

      const updatedSummary: LeadershipSummary = {
        analytics: {
          ...mockSummary.analytics,
          accounts_total: 200,
        },
      };

      component.summary = updatedSummary;

      expect(component.stats).toHaveLength(firstStatsLength);
      expect(component.stats[0].value).toBe('200');
    });
  });

  describe('Account Metrics Stats (Row 1)', () => {
    beforeEach(() => {
      component.summary = mockSummary;
    });

    it('should build total accounts stat correctly', () => {
      const totalAccountsStat = component.stats[0];

      expect(totalAccountsStat.label).toBe('Total Accounts');
      expect(totalAccountsStat.value).toBe('100');
      expect(totalAccountsStat.subtitle).toBe('All accounts');
      expect(totalAccountsStat.icon).toBe('business');
      expect(totalAccountsStat.iconColor).toBe('text-indigo-600');
    });

    it('should build active accounts stat with percentage', () => {
      const activeAccountsStat = component.stats[1];

      expect(activeAccountsStat.label).toBe('Active Accounts');
      expect(activeAccountsStat.value).toBe('80');
      expect(activeAccountsStat.subtitle).toBe('80% of total'); // .toFixed(0) rounds to whole number
      expect(activeAccountsStat.icon).toBe('check_circle');
      expect(activeAccountsStat.iconColor).toBe('text-green-600');
    });

    it('should build inactive accounts stat with percentage', () => {
      const inactiveAccountsStat = component.stats[2];

      expect(inactiveAccountsStat.label).toBe('Inactive Accounts');
      expect(inactiveAccountsStat.value).toBe('20');
      expect(inactiveAccountsStat.subtitle).toBe('20% of total'); // .toFixed(0) rounds to whole number
      expect(inactiveAccountsStat.icon).toBe('pause_circle');
      expect(inactiveAccountsStat.iconColor).toBe('text-orange-600');
    });

    it('should calculate account percentages correctly', () => {
      const customSummary: LeadershipSummary = {
        analytics: {
          ...mockSummary.analytics,
          accounts_total: 150,
          accounts_active: 100,
          accounts_inactive: 50,
        },
      };

      component.summary = customSummary;

      const activeStat = component.stats[1];
      const inactiveStat = component.stats[2];

      expect(activeStat.subtitle).toBe('67% of total'); // 100/150 = 66.67, rounds to 67
      expect(inactiveStat.subtitle).toBe('33% of total'); // 50/150 = 33.33, rounds to 33
    });
  });

  describe('Activity Metrics Stats (Row 2)', () => {
    beforeEach(() => {
      component.summary = mockSummary;
    });

    it('should build messages processed stat with compact format', () => {
      const messagesStat = component.stats[3];

      expect(messagesStat.label).toBe('Messages Processed');
      expect(messagesStat.value).toBe('50.0K'); // formatCompactNumber uses .toFixed(1)
      expect(messagesStat.subtitle).toBe('50,000 total');
      expect(messagesStat.icon).toBe('mail');
      expect(messagesStat.iconColor).toBe('text-blue-600');
    });

    it('should build notifications sent stat with compact format', () => {
      const notificationsSentStat = component.stats[4];

      expect(notificationsSentStat.label).toBe('Notifications Sent');
      expect(notificationsSentStat.value).toBe('45.0K');
      expect(notificationsSentStat.subtitle).toBe('45,000 total');
      expect(notificationsSentStat.icon).toBe('notifications');
      expect(notificationsSentStat.iconColor).toBe('text-purple-600');
    });

    it('should build notifications billed stat with compact format', () => {
      const notificationsBilledStat = component.stats[5];

      expect(notificationsBilledStat.label).toBe('Notifications Billed');
      expect(notificationsBilledStat.value).toBe('44.0K');
      expect(notificationsBilledStat.subtitle).toBe('44,000 total');
      expect(notificationsBilledStat.icon).toBe('receipt');
      expect(notificationsBilledStat.iconColor).toBe('text-pink-600');
    });

    it('should format large numbers with M for millions', () => {
      const largeSummary: LeadershipSummary = {
        analytics: {
          ...mockSummary.analytics,
          messages_processed_total: 2500000,
          notifications_sent_total: 1800000,
          notifications_billed_total: 1750000,
        },
      };

      component.summary = largeSummary;

      expect(component.stats[3].value).toBe('2.5M');
      expect(component.stats[4].value).toBe('1.8M');
      expect(component.stats[5].value).toBe('1.8M'); // 1750000 / 1000000 = 1.75, .toFixed(1) rounds to 1.8
    });
  });

  describe('Workflow & Efficiency Metrics Stats (Row 3)', () => {
    beforeEach(() => {
      component.summary = mockSummary;
    });

    it('should build total workflows stat', () => {
      const workflowsStat = component.stats[6];

      expect(workflowsStat.label).toBe('Total Workflows');
      expect(workflowsStat.value).toBe('500');
      expect(workflowsStat.subtitle).toBe('50 unique titles');
      expect(workflowsStat.icon).toBe('account_tree');
      expect(workflowsStat.iconColor).toBe('text-teal-600');
    });

    it('should build total automations stat', () => {
      const automationsStat = component.stats[7];

      expect(automationsStat.label).toBe('Total Automations');
      expect(automationsStat.value).toBe('1,000');
      expect(automationsStat.subtitle).toBe('Across all accounts');
      expect(automationsStat.icon).toBe('smart_toy');
      expect(automationsStat.iconColor).toBe('text-cyan-600');
    });

    it('should build billing efficiency stat with green color for high ratio', () => {
      const efficiencyStat = component.stats[8];

      expect(efficiencyStat.label).toBe('Billing Efficiency');
      expect(efficiencyStat.value).toBe('98.0%'); // formatPercentage uses .toFixed(1)
      expect(efficiencyStat.subtitle).toBe('Billed vs Sent ratio');
      expect(efficiencyStat.icon).toBe('trending_up');
      expect(efficiencyStat.iconColor).toBe('text-green-600'); // >= 0.9
    });

    it('should show orange color for billing efficiency below 90%', () => {
      const lowEfficiencySummary: LeadershipSummary = {
        analytics: {
          ...mockSummary.analytics,
          notifications_billed_ratio: 0.85,
        },
      };

      component.summary = lowEfficiencySummary;
      const efficiencyStat = component.stats[8];

      expect(efficiencyStat.value).toBe('85.0%');
      expect(efficiencyStat.iconColor).toBe('text-orange-600'); // < 0.9
    });

    it('should handle edge case of exactly 90% billing efficiency', () => {
      const edgeCaseSummary: LeadershipSummary = {
        analytics: {
          ...mockSummary.analytics,
          notifications_billed_ratio: 0.9,
        },
      };

      component.summary = edgeCaseSummary;
      const efficiencyStat = component.stats[8];

      expect(efficiencyStat.value).toBe('90.0%');
      expect(efficiencyStat.iconColor).toBe('text-green-600'); // >= 0.9
    });

    it('should handle null billing efficiency ratio', () => {
      const nullRatioSummary: LeadershipSummary = {
        analytics: {
          ...mockSummary.analytics,
          notifications_billed_ratio: null as any,
        },
      };

      component.summary = nullRatioSummary;
      const efficiencyStat = component.stats[8];

      expect(efficiencyStat.value).toBe('N/A'); // formatPercentage returns 'N/A' for null
      expect(efficiencyStat.iconColor).toBe('text-orange-600'); // null is falsy
    });
  });

  describe('Number Formatting', () => {
    it('should format numbers with commas for thousands', () => {
      const largeNumberSummary: LeadershipSummary = {
        analytics: {
          ...mockSummary.analytics,
          accounts_total: 1500,
          automation_count_total: 25000,
        },
      };

      component.summary = largeNumberSummary;

      expect(component.stats[0].value).toBe('1,500');
      expect(component.stats[7].value).toBe('25,000');
    });

    it('should handle zero values correctly', () => {
      const zeroSummary: LeadershipSummary = {
        analytics: {
          accounts_total: 0,
          accounts_active: 0,
          accounts_inactive: 0,
          workflows_total: 0,
          workflow_titles_unique: 0,
          automation_count_total: 0,
          messages_processed_total: 0,
          notifications_sent_total: 0,
          notifications_billed_total: 0,
          notifications_billed_ratio: 0,
        },
      };

      component.summary = zeroSummary;

      expect(component.stats[0].value).toBe('0');
      expect(component.stats[3].value).toBe('0');
      expect(component.stats[8].value).toBe('0.0%');
    });

    it('should format compact numbers for different magnitudes', () => {
      const magnitudeSummary: LeadershipSummary = {
        analytics: {
          ...mockSummary.analytics,
          messages_processed_total: 500, // No suffix, uses toLocaleString()
          notifications_sent_total: 5000, // 5.0K
          notifications_billed_total: 5000000, // 5.0M
        },
      };

      component.summary = magnitudeSummary;

      expect(component.stats[3].value).toBe('500');
      expect(component.stats[4].value).toBe('5.0K');
      expect(component.stats[5].value).toBe('5.0M');
    });
  });

  describe('Stats Array Structure', () => {
    beforeEach(() => {
      component.summary = mockSummary;
    });

    it('should always have exactly 9 stats', () => {
      expect(component.stats).toHaveLength(9);
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

    it('should organize stats in logical rows', () => {
      // Row 1: Account metrics (indices 0-2)
      expect(component.stats[0].label).toContain('Total Accounts');
      expect(component.stats[1].label).toContain('Active');
      expect(component.stats[2].label).toContain('Inactive');

      // Row 2: Activity metrics (indices 3-5)
      expect(component.stats[3].label).toContain('Messages');
      expect(component.stats[4].label).toContain('Notifications Sent');
      expect(component.stats[5].label).toContain('Notifications Billed');

      // Row 3: Workflow & efficiency (indices 6-8)
      expect(component.stats[6].label).toContain('Workflows');
      expect(component.stats[7].label).toContain('Automations');
      expect(component.stats[8].label).toContain('Efficiency');
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle very large numbers correctly', () => {
      const hugeSummary: LeadershipSummary = {
        analytics: {
          accounts_total: 999999,
          accounts_active: 500000,
          accounts_inactive: 499999,
          workflows_total: 1000000,
          workflow_titles_unique: 50000,
          automation_count_total: 9999999,
          messages_processed_total: 999999999,
          notifications_sent_total: 888888888,
          notifications_billed_total: 777777777,
          notifications_billed_ratio: 0.999,
        },
      };

      component.summary = hugeSummary;

      expect(component.stats[0].value).toBe('999,999');
      expect(component.stats[3].value).toBe('1000.0M');
      expect(component.stats[8].value).toBe('99.9%');
    });

    it('should handle decimal percentages correctly', () => {
      const decimalSummary: LeadershipSummary = {
        analytics: {
          ...mockSummary.analytics,
          accounts_total: 3,
          accounts_active: 1,
          accounts_inactive: 2,
        },
      };

      component.summary = decimalSummary;

      expect(component.stats[1].subtitle).toBe('33% of total'); // 1/3 = 33.33, .toFixed(0) = 33
      expect(component.stats[2].subtitle).toBe('67% of total'); // 2/3 = 66.67, .toFixed(0) = 67
    });

    it('should handle 100% efficiency correctly', () => {
      const perfectEfficiencySummary: LeadershipSummary = {
        analytics: {
          ...mockSummary.analytics,
          notifications_billed_ratio: 1.0,
        },
      };

      component.summary = perfectEfficiencySummary;
      const efficiencyStat = component.stats[8];

      expect(efficiencyStat.value).toBe('100.0%');
      expect(efficiencyStat.iconColor).toBe('text-green-600');
    });

    it('should handle very low efficiency correctly', () => {
      const lowEfficiencySummary: LeadershipSummary = {
        analytics: {
          ...mockSummary.analytics,
          notifications_billed_ratio: 0.01,
        },
      };

      component.summary = lowEfficiencySummary;
      const efficiencyStat = component.stats[8];

      expect(efficiencyStat.value).toBe('1.0%');
      expect(efficiencyStat.iconColor).toBe('text-orange-600');
    });
  });
});
