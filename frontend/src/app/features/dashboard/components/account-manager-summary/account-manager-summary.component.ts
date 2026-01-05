import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { ActionListCardComponent } from '../action-list-card/action-list-card.component';
import { formatNumber } from '../../../../common/utils/number-format.util';
import { AccountManagerSummary } from '../../../../common/models/summary.model';
import { MatIconModule } from '@angular/material/icon';

interface StatConfig {
  label: string;
  value: number | string;
  subtitle: string;
  icon: string;
  iconColor: string;
}

@Component({
  selector: 'app-account-manager-summary',
  standalone: true,
  imports: [CommonModule, MatIconModule, StatCardComponent, ActionListCardComponent],
  templateUrl: './account-manager-summary.component.html',
  styleUrls: ['./account-manager-summary.component.css'],
})
export class AccountManagerSummaryComponent {
  @Input() set summary(value: AccountManagerSummary | null) {
    if (value) {
      this._summary = value;
      this.buildStats(value);
    }
  }

  _summary: AccountManagerSummary | null = null;
  stats: StatConfig[] = [];

  private buildStats(summary: AccountManagerSummary): void {
    const a = summary.analytics;
    const totalIssues =
      a.inactive_with_usage_count +
      a.active_zero_activity_count +
      a.seats_vs_usage_mismatch_count +
      a.billed_vs_sent_anomalies_count;

    this.stats = [
      {
        label: 'Total Accounts',
        value: formatNumber(a.accounts_total),
        subtitle: 'Under management',
        icon: 'business',
        iconColor: 'text-indigo-600',
      },
      {
        label: 'Accounts Needing Attention',
        value: formatNumber(totalIssues),
        subtitle: totalIssues === 0 ? 'All healthy!' : 'Require action',
        icon: totalIssues === 0 ? 'check_circle' : 'warning',
        iconColor: totalIssues === 0 ? 'text-green-600' : 'text-orange-600',
      },
      {
        label: 'Inactive with Usage',
        value: formatNumber(a.inactive_with_usage_count),
        subtitle: 'Subscription inactive',
        icon: 'pause_circle',
        iconColor: 'text-orange-600',
      },
      {
        label: 'Active Zero Activity',
        value: formatNumber(a.active_zero_activity_count),
        subtitle: 'No measured activity',
        icon: 'hourglass_empty',
        iconColor: 'text-amber-600',
      },
    ];
  }
}
