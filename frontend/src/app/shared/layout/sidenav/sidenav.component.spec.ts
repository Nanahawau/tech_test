import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach } from 'vitest';
import { SidenavComponent } from './sidenav.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('SidenavComponent', () => {
  let component: SidenavComponent;
  let fixture: ComponentFixture<SidenavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidenavComponent, NoopAnimationsModule],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SidenavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with navigation items', () => {
      expect(component.navItems).toBeDefined();
      expect(component.navItems.length).toBeGreaterThan(0);
    });

    it('should have exactly 4 navigation items', () => {
      expect(component.navItems.length).toBe(4);
    });
  });

  describe('Navigation Items Structure', () => {
    it('should have Dashboard navigation item', () => {
      const dashboardItem = component.navItems.find((item) => item.label === 'Dashboard');

      expect(dashboardItem).toBeDefined();
      expect(dashboardItem?.route).toBe('/dashboard');
      expect(dashboardItem?.icon).toBe('dashboard');
    });

    it('should have Ingestion navigation item', () => {
      const ingestionItem = component.navItems.find((item) => item.label === 'Ingestion');

      expect(ingestionItem).toBeDefined();
      expect(ingestionItem?.route).toBe('/ingestion');
      expect(ingestionItem?.icon).toBe('upload_file');
    });

    it('should have Accounts navigation item', () => {
      const accountsItem = component.navItems.find((item) => item.label === 'Accounts');

      expect(accountsItem).toBeDefined();
      expect(accountsItem?.route).toBe('/accounts');
      expect(accountsItem?.icon).toBe('business');
    });

    it('should have Analytics navigation item', () => {
      const analyticsItem = component.navItems.find((item) => item.label === 'Analytics');

      expect(analyticsItem).toBeDefined();
      expect(analyticsItem?.route).toBe('/analytics');
      expect(analyticsItem?.icon).toBe('bar_chart');
    });

    it('should have all required properties for each nav item', () => {
      component.navItems.forEach((item) => {
        expect(item).toHaveProperty('label');
        expect(item).toHaveProperty('route');
        expect(item).toHaveProperty('icon');
        expect(typeof item.label).toBe('string');
        expect(typeof item.route).toBe('string');
        expect(typeof item.icon).toBe('string');
      });
    });

    it('should have non-empty values for all nav item properties', () => {
      component.navItems.forEach((item) => {
        expect(item.label).toBeTruthy();
        expect(item.route).toBeTruthy();
        expect(item.icon).toBeTruthy();
        expect(item.label.length).toBeGreaterThan(0);
        expect(item.route.length).toBeGreaterThan(0);
        expect(item.icon.length).toBeGreaterThan(0);
      });
    });

    it('should have routes starting with forward slash', () => {
      component.navItems.forEach((item) => {
        expect(item.route.startsWith('/')).toBe(true);
      });
    });

    it('should have unique routes', () => {
      const routes = component.navItems.map((item) => item.route);
      const uniqueRoutes = new Set(routes);

      expect(uniqueRoutes.size).toBe(routes.length);
    });

    it('should have unique labels', () => {
      const labels = component.navItems.map((item) => item.label);
      const uniqueLabels = new Set(labels);

      expect(uniqueLabels.size).toBe(labels.length);
    });
  });

  describe('Navigation Items Order', () => {
    it('should have navigation items in correct order', () => {
      expect(component.navItems[0].label).toBe('Dashboard');
      expect(component.navItems[1].label).toBe('Ingestion');
      expect(component.navItems[2].label).toBe('Accounts');
      expect(component.navItems[3].label).toBe('Analytics');
    });

    it('should have Dashboard as first item', () => {
      expect(component.navItems[0].label).toBe('Dashboard');
    });

    it('should have Analytics as last item', () => {
      const lastItem = component.navItems[component.navItems.length - 1];
      expect(lastItem.label).toBe('Analytics');
    });
  });

  describe('Template Integration', () => {
    it('should render navigation list', () => {
      const navList = fixture.debugElement.query(By.css('mat-nav-list'));
      expect(navList).toBeTruthy();
    });

    it('should render all navigation items', () => {
      const navItems = fixture.debugElement.queryAll(By.css('a[mat-list-item]'));
      expect(navItems.length).toBe(4);
    });

    it('should render icons for all navigation items', () => {
      const icons = fixture.debugElement.queryAll(By.css('mat-icon'));
      expect(icons.length).toBe(4);
    });

    it('should display correct labels in template', () => {
      const compiled = fixture.nativeElement;
      const text = compiled.textContent;

      expect(text).toContain('Dashboard');
      expect(text).toContain('Ingestion');
      expect(text).toContain('Accounts');
      expect(text).toContain('Analytics');
    });

    it('should display correct icons', () => {
      const icons = fixture.debugElement.queryAll(By.css('mat-icon'));
      const iconTexts = icons.map((icon) => icon.nativeElement.textContent?.trim());

      expect(iconTexts).toContain('dashboard');
      expect(iconTexts).toContain('upload_file');
      expect(iconTexts).toContain('business');
      expect(iconTexts).toContain('bar_chart');
    });
  });

  describe('Navigation Items Type Safety', () => {
    it('should conform to NavItem interface', () => {
      component.navItems.forEach((item) => {
        const keys = Object.keys(item);
        expect(keys).toContain('label');
        expect(keys).toContain('route');
        expect(keys).toContain('icon');
        expect(keys.length).toBe(3);
      });
    });
  });

  describe('Component Immutability', () => {
    it('should maintain navItems array reference', () => {
      const initialNavItems = component.navItems;
      fixture.detectChanges();

      expect(component.navItems).toBe(initialNavItems);
    });

    it('should have readonly-like behavior for navItems', () => {
      const originalLength = component.navItems.length;
      const originalFirstItem = component.navItems[0];

      expect(component.navItems.length).toBe(originalLength);
      expect(component.navItems[0]).toEqual(originalFirstItem);
    });
  });

  describe('Icon Names', () => {
    it('should use Material Design icon names', () => {
      const validMaterialIcons = ['dashboard', 'upload_file', 'business', 'bar_chart'];

      component.navItems.forEach((item) => {
        expect(validMaterialIcons).toContain(item.icon);
      });
    });
  });

  describe('Accessibility', () => {
    it('should render navigation as list', () => {
      const list = fixture.debugElement.query(By.css('mat-nav-list'));
      expect(list).toBeTruthy();
    });
  });
});
