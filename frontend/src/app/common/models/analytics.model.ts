// Chart data format returned by all analytics endpoints
export interface ChartData {
  labels: string[];
  values: number[];
}

export interface StatusUsageData {
  accounts: number;
  automation_count_total: number;
  messages_processed_total: number;
  notifications_sent_total: number;
  notifications_billed_total: number;
  total_records_total: number;
}

export interface UsageByStatusResponse {
  active: StatusUsageData;
  inactive: StatusUsageData;
}

export interface AnalyticsQueryParams {
  limit?: number;
}
