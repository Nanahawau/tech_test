export interface SubscriptionDTO {
  status: 'active' | 'inactive';
  admin_seats: number;
  user_seats: number;
  read_only_seats: number;
}

export interface UsageDTO {
  total_records: number;
  automation_count: number;
  messages_processed: number;
  notifications_sent: number;
  notifications_billed: number;
}

export interface WorkflowsDTO {
  count: number;
  titles: string[];
}

export interface AccountRecordDTO {
  account_uuid: string;
  account_label: string;
  subscription: SubscriptionDTO;
  usage: UsageDTO;
  workflows: WorkflowsDTO;
}

export interface AccountsPageDTO {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  items: AccountRecordDTO[];
}

export type Account = AccountRecordDTO;
export type AccountStatus = 'active' | 'inactive';

export interface AccountQueryParams {
  page?: number;
  page_size?: number;
  account_uuid?: string;
  status?: AccountStatus;
  search?: string;
  workflow_title?: string;
  sort_by?: SortBy;
  sort_dir?: SortDir;
}


export enum SortBy {
  ACCOUNT_LABEL = 'account_label',
  SUBSCRIPTION_STATUS = 'subscription_status',
  TOTAL_RECORDS = 'total_records',
  AUTOMATION_COUNT = 'automation_count',
  MESSAGES_PROCESSED = 'messages_processed',
  NOTIFICATIONS_SENT = 'notifications_sent'
}

export enum SortDir {
  ASC = 'asc',
  DESC = 'desc'
}