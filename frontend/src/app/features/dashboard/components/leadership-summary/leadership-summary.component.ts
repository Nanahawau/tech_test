import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import {
  formatCompactNumber,
  formatNumber,
  formatPercentage,
} from '../../../../common/utils/number-format.util';
import { LeadershipSummary } from '../../../../common/models/summary.model';

interface StatConfig {
  label: string;
  value: number | string;
  subtitle: string;
  icon: string;
  iconColor: string;
}

@Component({
  selector: 'app-leadership-summary',
  standalone: true,
  imports: [CommonModule, StatCardComponent],
  templateUrl: './leadership-summary.component.html',
  styleUrls: ['./leadership-summary.component.css'],
})
export class LeadershipSummaryComponent {
  @Input() set summary(value: LeadershipSummary | null) {
    if (value) {
      this.buildStats(value);
    }
  }

  stats: StatConfig[] = [];

  private buildStats(summary: LeadershipSummary): void {
    const a = summary.analytics;

    this.stats = [
      // Row 1: Account Metrics
      {
        label: 'Total Accounts',
        value: formatNumber(a.accounts_total),
        subtitle: 'All accounts',
        icon: 'business',
        iconColor: 'text-indigo-600',
      },
      {
        label: 'Active Accounts',
        value: formatNumber(a.accounts_active),
        subtitle: `${((a.accounts_active / a.accounts_total) * 100).toFixed(0)}% of total`,
        icon: 'check_circle',
        iconColor: 'text-green-600',
      },
      {
        label: 'Inactive Accounts',
        value: formatNumber(a.accounts_inactive),
        subtitle: `${((a.accounts_inactive / a.accounts_total) * 100).toFixed(0)}% of total`,
        icon: 'pause_circle',
        iconColor: 'text-orange-600',
      },

      // Row 2: Activity Metrics
      {
        label: 'Messages Processed',
        value: formatCompactNumber(a.messages_processed_total),
        subtitle: `${formatNumber(a.messages_processed_total)} total`,
        icon: 'mail',
        iconColor: 'text-blue-600',
      },
      {
        label: 'Notifications Sent',
        value: formatCompactNumber(a.notifications_sent_total),
        subtitle: `${formatNumber(a.notifications_sent_total)} total`,
        icon: 'notifications',
        iconColor: 'text-purple-600',
      },
      {
        label: 'Notifications Billed',
        value: formatCompactNumber(a.notifications_billed_total),
        subtitle: `${formatNumber(a.notifications_billed_total)} total`,
        icon: 'receipt',
        iconColor: 'text-pink-600',
      },

      // Row 3: Workflow & Efficiency
      {
        label: 'Total Workflows',
        value: formatNumber(a.workflows_total),
        subtitle: `${a.workflow_titles_unique} unique titles`,
        icon: 'account_tree',
        iconColor: 'text-teal-600',
      },
      {
        label: 'Total Automations',
        value: formatNumber(a.automation_count_total),
        subtitle: 'Across all accounts',
        icon: 'smart_toy',
        iconColor: 'text-cyan-600',
      },
      {
        label: 'Billing Efficiency',
        value: formatPercentage(a.notifications_billed_ratio),
        subtitle: 'Billed vs Sent ratio',
        icon: 'trending_up',
        iconColor:
          a.notifications_billed_ratio && a.notifications_billed_ratio >= 0.9
            ? 'text-green-600'
            : 'text-orange-600',
      },
    ];
  }
}
