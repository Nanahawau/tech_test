import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError, firstValueFrom } from 'rxjs';
import { filter, skip, take } from 'rxjs/operators';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AccountsExplorerComponent } from './accounts-explorer.component';
import { AccountsService } from '../../services/accounts.service';
import {
  AccountsPageDTO,
  AccountStatus,
  SortBy,
  SortDir,
} from '../../../../common/models/account.model';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';

interface AccountsState {
  pageData: AccountsPageDTO | null;
  isLoading: boolean;
  error: string | null;
}

describe('AccountsExplorerComponent', () => {
  let component: AccountsExplorerComponent;
  let fixture: ComponentFixture<AccountsExplorerComponent>;
  let accountsService: any;
  let router: any;
  let activatedRoute: any;

  const mockAccountsPageData: AccountsPageDTO = {
    page: 1,
    page_size: 25,
    total_items: 2,
    total_pages: 1,
    items: [
      {
        account_uuid: 'uuid-1',
        account_label: 'Test Account 1',
        subscription: {
          status: 'active' as AccountStatus,
          admin_seats: 2,
          user_seats: 5,
          read_only_seats: 3,
        },
        usage: {
          total_records: 1000,
          automation_count: 10,
          messages_processed: 5000,
          notifications_sent: 4500,
          notifications_billed: 4000,
        },
        workflows: {
          count: 2,
          titles: ['Workflow 1', 'Workflow 2'],
        },
      },
      {
        account_uuid: 'uuid-2',
        account_label: 'Test Account 2',
        subscription: {
          status: 'inactive' as AccountStatus,
          admin_seats: 1,
          user_seats: 2,
          read_only_seats: 1,
        },
        usage: {
          total_records: 500,
          automation_count: 5,
          messages_processed: 2000,
          notifications_sent: 1800,
          notifications_billed: 1500,
        },
        workflows: {
          count: 1,
          titles: ['Workflow 3'],
        },
      },
    ],
  };

  beforeEach(async () => {
    accountsService = {
      getAccounts: vi.fn().mockReturnValue(of(mockAccountsPageData)),
    };

    router = {
      navigate: vi.fn().mockResolvedValue(true),
    };

    activatedRoute = {
      queryParams: of({}),
    };

    await TestBed.configureTestingModule({
      imports: [AccountsExplorerComponent, NoopAnimationsModule],
      providers: [
        { provide: AccountsService, useValue: accountsService },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: activatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountsExplorerComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.page).toBe(1);
      expect(component.pageSize).toBe(25);
      expect(component.sortBy).toBe(SortBy.ACCOUNT_LABEL);
      expect(component.sortDir).toBe(SortDir.ASC);
    });

    it('should load accounts on init', () => {
      fixture.detectChanges();

      expect(accountsService.getAccounts).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          page_size: 25,
          sort_by: SortBy.ACCOUNT_LABEL,
          sort_dir: SortDir.ASC,
        }),
      );
    });

    it('should populate account UUID from query params', async () => {
      activatedRoute.queryParams = of({ account_uuid: 'test-uuid-123' });

      fixture = TestBed.createComponent(AccountsExplorerComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(component.accountUuidControl.value).toBe('test-uuid-123');
    });

    it('should display loading state initially', async () => {
      const loadingState = firstValueFrom(
        component.state$.pipe(
          skip(1),
          filter((state) => state.isLoading),
          take(1),
        ),
      );

      fixture.detectChanges();

      const state = await loadingState;
      expect(state.isLoading).toBe(true);
    });
  });

  describe('Loading Accounts', () => {
    it('should update state with accounts data on successful load', async () => {
      const loadedState = firstValueFrom(
        component.state$.pipe(
          skip(1),
          filter((state) => state.pageData !== null),
          take(1),
        ),
      );

      fixture.detectChanges();

      const state = await loadedState;
      expect(state.pageData).toEqual(mockAccountsPageData);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle API errors gracefully', async () => {
      accountsService.getAccounts.mockReturnValue(throwError(() => new Error('API Error')));

      const errorState = firstValueFrom(
        component.state$.pipe(
          skip(1),
          filter((state) => state.error !== null),
          take(1),
        ),
      );

      fixture.detectChanges();

      const state = await errorState;
      expect(state.error).toBe('Failed to load accounts. Please try again.');
      expect(state.isLoading).toBe(false);
    });

    it('should pass correct parameters to service', () => {
      fixture.detectChanges();
      vi.clearAllMocks();

      component.page = 2;
      component.pageSize = 50;
      component.sortBy = SortBy.TOTAL_RECORDS;
      component.sortDir = SortDir.DESC;

      component.loadAccounts();

      expect(accountsService.getAccounts).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          page_size: 50,
          sort_by: SortBy.TOTAL_RECORDS,
          sort_dir: SortDir.DESC,
        }),
      );
    });
  });

  describe('Search Functionality', () => {
    it('should trigger search after debounce', async () => {
      fixture.detectChanges();
      vi.clearAllMocks();

      component.searchControl.setValue('test search');

      await new Promise((resolve) => setTimeout(resolve, 350));

      expect(accountsService.getAccounts).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'test search' }),
      );
    });

    it('should reset page to 1 on search', async () => {
      fixture.detectChanges();
      component.page = 5;

      component.searchControl.setValue('test');

      await new Promise((resolve) => setTimeout(resolve, 350));

      expect(component.page).toBe(1);
    });

    it('should not trigger multiple calls for same search value', async () => {
      fixture.detectChanges();
      vi.clearAllMocks();

      component.searchControl.setValue('test');
      await new Promise((resolve) => setTimeout(resolve, 150));
      component.searchControl.setValue('test');
      await new Promise((resolve) => setTimeout(resolve, 350));

      expect(accountsService.getAccounts).toHaveBeenCalledTimes(1);
    });

    it('should not include search param when empty', () => {
      fixture.detectChanges();
      vi.clearAllMocks();
      component.searchControl.setValue('');

      component.loadAccounts();

      const callArg = accountsService.getAccounts.mock.calls[0][0];
      expect(callArg.search).toBeUndefined();
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      fixture.detectChanges();
      vi.clearAllMocks();
    });

    it('should filter by account UUID', async () => {
      component.accountUuidControl.setValue('uuid-123');

      await new Promise((resolve) => setTimeout(resolve, 350));

      expect(accountsService.getAccounts).toHaveBeenCalledWith(
        expect.objectContaining({ account_uuid: 'uuid-123' }),
      );
    });

    it('should not include account_uuid when empty', () => {
      component.accountUuidControl.setValue('');
      component.loadAccounts();

      const callArg = accountsService.getAccounts.mock.calls[0][0];
      expect(callArg.account_uuid).toBeUndefined();
    });

    it('should filter by status', () => {
      component.statusFilter.setValue('active');

      expect(accountsService.getAccounts).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'active' }),
      );
    });

    it('should not include status when set to "all"', () => {
      component.statusFilter.setValue('all');

      vi.clearAllMocks();
      component.loadAccounts();

      const callArg = accountsService.getAccounts.mock.calls[0][0];
      expect(callArg.status).toBeUndefined();
    });

    it('should filter by workflow title', async () => {
      component.workflowFilter.setValue('My Workflow');

      await new Promise((resolve) => setTimeout(resolve, 350));

      expect(accountsService.getAccounts).toHaveBeenCalledWith(
        expect.objectContaining({ workflow_title: 'My Workflow' }),
      );
    });

    it('should not include workflow_title when empty', () => {
      component.workflowFilter.setValue('');
      component.loadAccounts();

      const callArg = accountsService.getAccounts.mock.calls[0][0];
      expect(callArg.workflow_title).toBeUndefined();
    });

    it('should combine multiple filters', async () => {
      component.accountUuidControl.setValue('uuid-123');
      component.statusFilter.setValue('active');
      component.searchControl.setValue('test');

      await new Promise((resolve) => setTimeout(resolve, 350));

      expect(accountsService.getAccounts).toHaveBeenCalledWith(
        expect.objectContaining({
          account_uuid: 'uuid-123',
          status: 'active',
          search: 'test',
        }),
      );
    });

    it('should reset page to 1 when applying filters', async () => {
      component.page = 5;
      component.statusFilter.setValue('active');

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(component.page).toBe(1);
    });
  });

  describe('Sorting', () => {
    beforeEach(() => {
      fixture.detectChanges();
      vi.clearAllMocks();
    });

    it('should sort by account label ascending', () => {
      const sort: Sort = { active: 'account_label', direction: 'asc' };
      component.onSort(sort);

      expect(component.sortBy).toBe(SortBy.ACCOUNT_LABEL);
      expect(component.sortDir).toBe(SortDir.ASC);
      expect(accountsService.getAccounts).toHaveBeenCalled();
    });

    it('should sort by total records descending', () => {
      const sort: Sort = { active: 'records', direction: 'desc' };
      component.onSort(sort);

      expect(component.sortBy).toBe(SortBy.TOTAL_RECORDS);
      expect(component.sortDir).toBe(SortDir.DESC);
      expect(accountsService.getAccounts).toHaveBeenCalled();
    });

    it('should sort by automation count', () => {
      const sort: Sort = { active: 'automations', direction: 'asc' };
      component.onSort(sort);

      expect(component.sortBy).toBe(SortBy.AUTOMATION_COUNT);
      expect(accountsService.getAccounts).toHaveBeenCalled();
    });

    it('should sort by messages processed', () => {
      const sort: Sort = { active: 'messages', direction: 'desc' };
      component.onSort(sort);

      expect(component.sortBy).toBe(SortBy.MESSAGES_PROCESSED);
      expect(accountsService.getAccounts).toHaveBeenCalled();
    });

    it('should sort by notifications sent', () => {
      const sort: Sort = { active: 'notifications', direction: 'asc' };
      component.onSort(sort);

      expect(component.sortBy).toBe(SortBy.NOTIFICATIONS_SENT);
      expect(accountsService.getAccounts).toHaveBeenCalled();
    });

    it('should handle invalid sort column gracefully', () => {
      const sort: Sort = { active: 'invalid_column', direction: 'asc' };
      component.onSort(sort);

      expect(component.sortBy).toBe(SortBy.ACCOUNT_LABEL);
      expect(accountsService.getAccounts).toHaveBeenCalled();
    });

    it('should not reload when sort direction is empty', () => {
      const sort: Sort = { active: 'account_label', direction: '' };
      component.onSort(sort);

      expect(accountsService.getAccounts).not.toHaveBeenCalled();
    });

    it('should not reload when sort active is empty', () => {
      const sort: Sort = { active: '', direction: 'asc' };
      component.onSort(sort);

      expect(accountsService.getAccounts).not.toHaveBeenCalled();
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      fixture.detectChanges();
      vi.clearAllMocks();
    });

    it('should handle page change', () => {
      const event: PageEvent = {
        pageIndex: 2,
        pageSize: 25,
        length: 100,
      };

      component.onPageChange(event);

      expect(component.page).toBe(3);
      expect(accountsService.getAccounts).toHaveBeenCalled();
    });

    it('should handle page size change and reset to first page', () => {
      component.page = 5;
      const event: PageEvent = {
        pageIndex: 0,
        pageSize: 50,
        length: 100,
      };

      component.onPageChange(event);

      expect(component.pageSize).toBe(50);
      expect(component.page).toBe(1);
      expect(accountsService.getAccounts).toHaveBeenCalled();
    });

    it('should handle navigation to last page', () => {
      const event: PageEvent = {
        pageIndex: 9,
        pageSize: 10,
        length: 100,
      };

      component.onPageChange(event);

      expect(component.page).toBe(10);
      expect(accountsService.getAccounts).toHaveBeenCalled();
    });
  });

  describe('Clear Filters', () => {
    it('should reset all filters to default values', async () => {
      fixture.detectChanges();

      component.accountUuidControl.setValue('uuid-123');
      component.searchControl.setValue('test search');
      component.statusFilter.setValue('active');
      component.workflowFilter.setValue('workflow');
      component.page = 5;

      await new Promise((resolve) => setTimeout(resolve, 350));

      vi.clearAllMocks();
      component.clearFilters();

      expect(component.accountUuidControl.value).toBe('');
      expect(component.searchControl.value).toBe('');
      expect(component.statusFilter.value).toBe('all');
      expect(component.workflowFilter.value).toBe('');
      expect(component.page).toBe(1);
    });

    it('should clear query parameters', () => {
      fixture.detectChanges();
      component.clearFilters();

      expect(router.navigate).toHaveBeenCalledWith([], {
        queryParams: {},
        replaceUrl: true,
      });
    });

    it('should reload accounts with default params after clearing filters', () => {
      fixture.detectChanges();
      vi.clearAllMocks();

      component.clearFilters();

      expect(accountsService.getAccounts).toHaveBeenCalled();
    });
  });

  describe('Helper Methods', () => {
    it('should return correct status color for active', () => {
      const color = component.getStatusColor('active');
      expect(color).toBe('bg-green-100 text-green-800');
    });

    it('should return correct status color for inactive', () => {
      const color = component.getStatusColor('inactive');
      expect(color).toBe('bg-red-100 text-red-800');
    });

    it('should return default color for unknown status', () => {
      const color = component.getStatusColor('unknown' as AccountStatus);
      expect(color).toBe('bg-red-100 text-red-800');
    });

    it('should calculate total seats correctly', () => {
      const account = mockAccountsPageData.items[0];
      const total = component.getTotalSeats(account);
      expect(total).toBe(10);
    });

    it('should calculate total seats for different account', () => {
      const account = mockAccountsPageData.items[1];
      const total = component.getTotalSeats(account);
      expect(total).toBe(4);
    });

    it('should format numbers with locale formatting', () => {
      expect(component.formatNumber(1000)).toBe('1,000');
      expect(component.formatNumber(1000000)).toBe('1,000,000');
      expect(component.formatNumber(0)).toBe('0');
    });

    it('should create workflow tooltip from titles', () => {
      const titles = ['Workflow 1', 'Workflow 2', 'Workflow 3'];
      const tooltip = component.getWorkflowsTooltip(titles);
      expect(tooltip).toBe('Workflow 2\n• Workflow 3');
    });

    it('should handle single workflow title', () => {
      const titles = ['Workflow 1'];
      const tooltip = component.getWorkflowsTooltip(titles);
      expect(tooltip).toBe('');
    });

    it('should handle empty workflow titles', () => {
      const titles: string[] = [];
      const tooltip = component.getWorkflowsTooltip(titles);
      expect(tooltip).toBe('');
    });
  });

  describe('Table Display', () => {
    it('should have correct column definitions', () => {
      expect(component.displayedColumns).toEqual([
        'account_label',
        'subscription_status',
        'seats',
        'records',
        'automations',
        'messages',
        'notifications',
      ]);
    });

    it('should have correct page size options', () => {
      expect(component.pageSizeOptions).toEqual([5, 10, 25, 50, 100]);
    });
  });

  describe('State Management', () => {
    it('should emit initial state', async () => {
      const initialState = await firstValueFrom(component.state$);

      expect(initialState.pageData).toBeNull();
      expect(initialState.isLoading).toBe(false);
      expect(initialState.error).toBeNull();
    });

    it('should update state correctly during load sequence', async () => {
      const states: AccountsState[] = [];

      const subscription = component.state$.subscribe((state) => {
        states.push(state);
      });

      fixture.detectChanges();

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(states.length).toBeGreaterThanOrEqual(2);

      const finalState = states[states.length - 1];
      expect(finalState.isLoading).toBe(false);
      expect(finalState.pageData).toEqual(mockAccountsPageData);

      subscription.unsubscribe();
    });
  });
});
