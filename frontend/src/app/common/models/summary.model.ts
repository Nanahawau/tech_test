export type Audience = 'leadership' | 'account_manager';

export interface LeadershipAnalytics {
  accounts_total: number;
  accounts_active: number;
  accounts_inactive: number;
  workflows_total: number;
  workflow_titles_unique: number;
  automation_count_total: number;
  messages_processed_total: number;
  notifications_sent_total: number;
  notifications_billed_total: number;
  notifications_billed_ratio: number | null;
}

export interface LeadershipSummary {
  analytics: LeadershipAnalytics;
}

export interface AccountManagerAnalytics {
  accounts_total: number;
  inactive_with_usage_count: number;
  active_zero_activity_count: number;
  seats_vs_usage_mismatch_count: number;
  billed_vs_sent_anomalies_count: number;
}

export interface AccountRef {
  account_uuid: string;
  account_label: string;
}

export interface ActionList {
  reason: string;
  recommended_actions: string[];
  items: AccountRef[];
}

export interface AccountManagerActionLists {
  inactive_with_usage: ActionList;
  active_zero_activity: ActionList;
  seats_vs_usage_mismatch: ActionList;
  billed_vs_sent_anomalies: ActionList;
}

export interface AccountManagerSummary {
  analytics: AccountManagerAnalytics;
  action_lists: AccountManagerActionLists;
  notes?: string[] | null;
}

export type SummaryResponse = LeadershipSummary | AccountManagerSummary;

export function isLeadershipSummary(summary: SummaryResponse): summary is LeadershipSummary {
  return 'analytics' in summary && 'accounts_active' in summary.analytics;
}

export function isAccountManagerSummary(
  summary: SummaryResponse,
): summary is AccountManagerSummary {
  return 'action_lists' in summary;
}
