import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActionListCardComponent } from './action-list-card.component';
import { ActionList } from '../../../../common/models/summary.model';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ActionListCardComponent', () => {
  let component: ActionListCardComponent;
  let fixture: ComponentFixture<ActionListCardComponent>;
  let router: any;

  const mockActionList: ActionList = {
    reason: 'These accounts are inactive but showing usage',
    recommended_actions: ['Contact account', 'Verify status', 'Review subscription'],
    items: [
      { account_uuid: 'uuid-1', account_label: 'Account 1' },
      { account_uuid: 'uuid-2', account_label: 'Account 2' },
      { account_uuid: 'uuid-3', account_label: 'Account 3' },
    ],
  };

  beforeEach(async () => {
    router = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ActionListCardComponent, NoopAnimationsModule],
      providers: [{ provide: Router, useValue: router }],
    }).compileComponents();

    fixture = TestBed.createComponent(ActionListCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.title).toBe('');
      expect(component.actionList).toBeNull();
      expect(component.iconName).toBe('warning');
      expect(component.iconColor).toBe('text-orange-600');
      expect(component.isExpanded).toBe(true);
    });
  });

  describe('Input Properties', () => {
    it('should accept title input', () => {
      component.title = 'Inactive with Usage';
      expect(component.title).toBe('Inactive with Usage');
    });

    it('should accept actionList input', () => {
      component.actionList = mockActionList;
      expect(component.actionList).toEqual(mockActionList);
    });

    it('should accept iconName input', () => {
      component.iconName = 'pause_circle';
      expect(component.iconName).toBe('pause_circle');
    });

    it('should accept iconColor input', () => {
      component.iconColor = 'text-red-600';
      expect(component.iconColor).toBe('text-red-600');
    });
  });

  describe('Toggle Expanded', () => {
    it('should toggle isExpanded from true to false', () => {
      component.isExpanded = true;
      component.toggleExpanded();
      expect(component.isExpanded).toBe(false);
    });

    it('should toggle isExpanded from false to true', () => {
      component.isExpanded = false;
      component.toggleExpanded();
      expect(component.isExpanded).toBe(true);
    });

    it('should toggle multiple times correctly', () => {
      component.isExpanded = true;

      component.toggleExpanded();
      expect(component.isExpanded).toBe(false);

      component.toggleExpanded();
      expect(component.isExpanded).toBe(true);

      component.toggleExpanded();
      expect(component.isExpanded).toBe(false);
    });
  });

  describe('View Account', () => {
    it('should navigate to accounts page with account_uuid query param', () => {
      const accountUuid = 'test-uuid-123';

      component.viewAccount(accountUuid);

      expect(router.navigate).toHaveBeenCalledWith(['/accounts'], {
        queryParams: { account_uuid: accountUuid },
      });
    });

    it('should navigate with different account uuids', () => {
      const uuid1 = 'uuid-1';
      const uuid2 = 'uuid-2';

      component.viewAccount(uuid1);
      expect(router.navigate).toHaveBeenCalledWith(['/accounts'], {
        queryParams: { account_uuid: uuid1 },
      });

      component.viewAccount(uuid2);
      expect(router.navigate).toHaveBeenCalledWith(['/accounts'], {
        queryParams: { account_uuid: uuid2 },
      });
    });
  });

  describe('Item Count Getter', () => {
    it('should return correct count when actionList has items', () => {
      component.actionList = mockActionList;
      expect(component.itemCount).toBe(3);
    });

    it('should return 0 when actionList is null', () => {
      component.actionList = null;
      expect(component.itemCount).toBe(0);
    });

    it('should return 0 when actionList has no items', () => {
      component.actionList = {
        reason: 'Test reason',
        recommended_actions: [],
        items: [],
      };
      expect(component.itemCount).toBe(0);
    });

    it('should return correct count for single item', () => {
      component.actionList = {
        reason: 'Test reason',
        recommended_actions: [],
        items: [{ account_uuid: 'uuid-1', account_label: 'Account 1' }],
      };
      expect(component.itemCount).toBe(1);
    });

    it('should update when actionList changes', () => {
      component.actionList = mockActionList;
      expect(component.itemCount).toBe(3);

      component.actionList = {
        reason: 'Test',
        recommended_actions: [],
        items: [{ account_uuid: 'uuid-1', account_label: 'Account 1' }],
      };
      expect(component.itemCount).toBe(1);
    });
  });

  describe('Has Items Getter', () => {
    it('should return true when actionList has items', () => {
      component.actionList = mockActionList;
      expect(component.hasItems).toBe(true);
    });

    it('should return false when actionList is null', () => {
      component.actionList = null;
      expect(component.hasItems).toBe(false);
    });

    it('should return false when actionList has empty items array', () => {
      component.actionList = {
        reason: 'Test reason',
        recommended_actions: [],
        items: [],
      };
      expect(component.hasItems).toBe(false);
    });

    it('should return true for single item', () => {
      component.actionList = {
        reason: 'Test',
        recommended_actions: [],
        items: [{ account_uuid: 'uuid-1', account_label: 'Account 1' }],
      };
      expect(component.hasItems).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle actionList with empty recommended actions', () => {
      component.actionList = {
        reason: 'Test reason',
        recommended_actions: [],
        items: mockActionList.items,
      };

      expect(component.itemCount).toBe(3);
      expect(component.hasItems).toBe(true);
    });

    it('should handle actionList with empty reason', () => {
      component.actionList = {
        reason: '',
        recommended_actions: mockActionList.recommended_actions,
        items: mockActionList.items,
      };

      expect(component.itemCount).toBe(3);
      expect(component.actionList.reason).toBe('');
    });

    it('should handle very long account labels', () => {
      const longLabel = 'A'.repeat(200);
      component.actionList = {
        reason: 'Test',
        recommended_actions: [],
        items: [{ account_uuid: 'uuid-1', account_label: longLabel }],
      };

      expect(component.actionList.items[0].account_label).toBe(longLabel);
      expect(component.itemCount).toBe(1);
    });

    it('should handle special characters in account_uuid', () => {
      const specialUuid = 'uuid-123-abc!@#$%';

      component.viewAccount(specialUuid);

      expect(router.navigate).toHaveBeenCalledWith(['/accounts'], {
        queryParams: { account_uuid: specialUuid },
      });
    });
  });

  describe('Component State', () => {
    it('should maintain expanded state after setting actionList', () => {
      component.isExpanded = false;
      component.actionList = mockActionList;

      expect(component.isExpanded).toBe(false);
    });

    it('should maintain title after toggling expanded', () => {
      component.title = 'Test Title';
      component.toggleExpanded();

      expect(component.title).toBe('Test Title');
    });

    it('should handle multiple property updates', () => {
      component.title = 'Inactive Accounts';
      component.iconName = 'pause_circle';
      component.iconColor = 'text-red-600';
      component.actionList = mockActionList;

      expect(component.title).toBe('Inactive Accounts');
      expect(component.iconName).toBe('pause_circle');
      expect(component.iconColor).toBe('text-red-600');
      expect(component.itemCount).toBe(3);
    });
  });
});
