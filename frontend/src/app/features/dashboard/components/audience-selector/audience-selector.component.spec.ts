import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AudienceSelectorComponent } from './audience-selector.component';
import { Audience } from '../../../../common/models/summary.model';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('AudienceSelectorComponent', () => {
  let component: AudienceSelectorComponent;
  let fixture: ComponentFixture<AudienceSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AudienceSelectorComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AudienceSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with leadership as default audience', () => {
      expect(component.selectedAudience).toBe('leadership');
    });

    it('should have audienceChange event emitter', () => {
      expect(component.audienceChange).toBeDefined();
    });
  });

  describe('Selected Audience Input', () => {
    it('should accept leadership as input', () => {
      component.selectedAudience = 'leadership';
      expect(component.selectedAudience).toBe('leadership');
    });

    it('should accept account_manager as input', () => {
      component.selectedAudience = 'account_manager';
      expect(component.selectedAudience).toBe('account_manager');
    });

    it('should update selectedAudience through input binding', async () => {
      const newAudience: Audience = 'account_manager';
      component.selectedAudience = newAudience;

      // Wait for change detection to complete
      await fixture.whenStable();

      expect(component.selectedAudience).toBe('account_manager');
    });
  });

  describe('Audience Change Event', () => {
    it('should emit audienceChange event with leadership', () => {
      const spy = vi.fn();
      component.audienceChange.subscribe(spy);

      component.onAudienceChange('leadership');

      expect(spy).toHaveBeenCalledWith('leadership');
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should emit audienceChange event with account_manager', () => {
      const spy = vi.fn();
      component.audienceChange.subscribe(spy);

      component.onAudienceChange('account_manager');

      expect(spy).toHaveBeenCalledWith('account_manager');
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should emit correct audience type', () => {
      let emittedValue: Audience | undefined;
      component.audienceChange.subscribe((value) => (emittedValue = value));

      component.onAudienceChange('leadership');

      expect(emittedValue).toBe('leadership');
    });

    it('should emit multiple times when called multiple times', () => {
      const spy = vi.fn();
      component.audienceChange.subscribe(spy);

      component.onAudienceChange('leadership');
      component.onAudienceChange('account_manager');
      component.onAudienceChange('leadership');

      expect(spy).toHaveBeenCalledTimes(3);
      expect(spy).toHaveBeenNthCalledWith(1, 'leadership');
      expect(spy).toHaveBeenNthCalledWith(2, 'account_manager');
      expect(spy).toHaveBeenNthCalledWith(3, 'leadership');
    });
  });

  describe('Component Behavior', () => {
    it('should not change selectedAudience when onAudienceChange is called', () => {
      component.selectedAudience = 'leadership';

      component.onAudienceChange('account_manager');

      // Component doesn't update its own state, only emits event
      expect(component.selectedAudience).toBe('leadership');
    });

    it('should allow external updates to selectedAudience', () => {
      component.selectedAudience = 'leadership';
      expect(component.selectedAudience).toBe('leadership');

      component.selectedAudience = 'account_manager';
      expect(component.selectedAudience).toBe('account_manager');
    });
  });

  describe('Event Emitter Lifecycle', () => {
    it('should handle subscription and unsubscription', () => {
      const spy = vi.fn();
      const subscription = component.audienceChange.subscribe(spy);

      component.onAudienceChange('leadership');
      expect(spy).toHaveBeenCalledTimes(1);

      subscription.unsubscribe();

      component.onAudienceChange('account_manager');
      // Should still be 1 since we unsubscribed
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should support multiple subscribers', () => {
      const spy1 = vi.fn();
      const spy2 = vi.fn();

      component.audienceChange.subscribe(spy1);
      component.audienceChange.subscribe(spy2);

      component.onAudienceChange('leadership');

      expect(spy1).toHaveBeenCalledWith('leadership');
      expect(spy2).toHaveBeenCalledWith('leadership');
    });
  });

  describe('Type Safety', () => {
    it('should only accept valid Audience types', () => {
      const validAudiences: Audience[] = ['leadership', 'account_manager'];

      validAudiences.forEach((audience) => {
        component.selectedAudience = audience;
        expect(component.selectedAudience).toBe(audience);
      });
    });

    it('should emit values matching Audience type', () => {
      let emittedValue: Audience | undefined;
      component.audienceChange.subscribe((value) => {
        emittedValue = value;
        expect(['leadership', 'account_manager']).toContain(value);
      });

      component.onAudienceChange('leadership');
    });
  });
});
