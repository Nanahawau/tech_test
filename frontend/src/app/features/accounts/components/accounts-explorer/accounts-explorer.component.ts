import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { AccountsService } from '../../services/accounts.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { Account, AccountsPageDTO, AccountStatus, SortBy, SortDir } from '../../../../common/models/account.model';
import { MatMenuModule } from '@angular/material/menu';

interface AccountsState {
  pageData: AccountsPageDTO | null;
  isLoading: boolean;
  error: string | null;
}

@Component({
  selector: 'app-accounts-explorer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatCardModule,
    LoadingSpinnerComponent,
    MatMenuModule
  ],
  templateUrl: './accounts-explorer.component.html',
  styleUrls: ['./accounts-explorer.component.css']
})
export class AccountsExplorerComponent implements OnInit {
  private stateSubject = new BehaviorSubject<AccountsState>({
    pageData: null,
    isLoading: false,
    error: null
  });

  state$ = this.stateSubject.asObservable();

  // Form controls
  accountUuidControl = new FormControl('');
  searchControl = new FormControl('');
  statusFilter = new FormControl<AccountStatus | 'all'>('all');
  workflowFilter = new FormControl('');

  // Table configuration
  displayedColumns: string[] = [
    'account_label',
    'subscription_status',
    'seats',
    'records',
    'automations',
    'messages',
    'notifications'
  ];

  // Pagination - default values
  page = 1;
  pageSize = 25;
  pageSizeOptions = [5, 10, 25, 50, 100];

  // Sorting
  sortBy: SortBy = SortBy.ACCOUNT_LABEL;
  sortDir: SortDir = SortDir.ASC;

  // Mapping for sort columns
  private sortColumnMap: { [key: string]: SortBy } = {
    'account_label': SortBy.ACCOUNT_LABEL,
    'subscription_status': SortBy.SUBSCRIPTION_STATUS,
    'records': SortBy.TOTAL_RECORDS,
    'automations': SortBy.AUTOMATION_COUNT,
    'messages': SortBy.MESSAGES_PROCESSED,
    'notifications': SortBy.NOTIFICATIONS_SENT
  };

  constructor(
    private accountsService: AccountsService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Check for query params (from dashboard)
    this.route.queryParams.subscribe(params => {
      if (params['account_uuid']) {
        this.accountUuidControl.setValue(params['account_uuid'], { emitEvent: false });
      }
    });

    this.accountUuidControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.page = 1;
        this.loadAccounts();
      });

    // Setup search with debounce
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.page = 1; // Reset to first page on search
        this.loadAccounts();
      });

    // Setup status filter
    this.statusFilter.valueChanges.subscribe(() => {
      this.page = 1; // Reset to first page on filter change
      this.loadAccounts();
    });

    // Setup workflow filter
    this.workflowFilter.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.page = 1;
        this.loadAccounts();
      });

    // Initial load
    this.loadAccounts();
  }

  loadAccounts(): void {
    const currentState = this.stateSubject.value;

    this.stateSubject.next({
      ...currentState,
      isLoading: true,
      error: null
    });

    const params = {
      page: this.page,
      page_size: this.pageSize,
      sort_by: this.sortBy,
      sort_dir: this.sortDir,
      ...(this.accountUuidControl.value && { account_uuid: this.accountUuidControl.value }),
      ...(this.searchControl.value && { search: this.searchControl.value }),
      ...(this.statusFilter.value && this.statusFilter.value !== 'all' && {
        status: this.statusFilter.value
      }),
      ...(this.workflowFilter.value && { workflow_title: this.workflowFilter.value })
    };

    this.accountsService.getAccounts(params).subscribe({
      next: (pageData) => {
        this.stateSubject.next({
          pageData,
          isLoading: false,
          error: null
        });
      },
      error: (error) => {
        console.error('Failed to load accounts:', error);
        this.stateSubject.next({
          ...this.stateSubject.value,
          isLoading: false,
          error: 'Failed to load accounts. Please try again.'
        });
      }
    });
  }

  onSort(sort: Sort): void {
    if (!sort.active || !sort.direction) {
      return;
    }

    // Map Material table column to backend sort field
    this.sortBy = this.sortColumnMap[sort.active] || SortBy.ACCOUNT_LABEL;
    this.sortDir = sort.direction === 'asc' ? SortDir.ASC : SortDir.DESC;

    this.loadAccounts();
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1; // Material paginator is 0-based, API is 1-based
    this.pageSize = event.pageSize;
    this.loadAccounts();
  }

  clearFilters(): void {
    this.accountUuidControl.setValue('', { emitEvent: false });
    this.searchControl.setValue('', { emitEvent: false });
    this.statusFilter.setValue('all', { emitEvent: false });
    this.workflowFilter.setValue('', { emitEvent: false });
    this.page = 1;

    // Clear query params
    this.router.navigate([], {
      queryParams: {},
      replaceUrl: true
    });

    this.loadAccounts();
  }

  getStatusColor(status: AccountStatus): string {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      trial: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.inactive;
  }

  getTotalSeats(account: Account): number {
    return account.subscription.admin_seats + account.subscription.user_seats + account.subscription.read_only_seats;
  }

  formatNumber(num: number): string {
    return num.toLocaleString();
  }

  getWorkflowsTooltip(titles: string[]): string {
    return titles.slice(1).join('\n• ');
  }
}