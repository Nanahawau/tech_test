import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, BehaviorSubject } from 'rxjs';
import { ShellComponent } from './shell.component';
import { By } from '@angular/platform-browser';

describe('ShellComponent', () => {
  let component: ShellComponent;
  let fixture: ComponentFixture<ShellComponent>;
  let breakpointObserver: any;
  let breakpointSubject: BehaviorSubject<any>;

  beforeEach(async () => {
    breakpointSubject = new BehaviorSubject({ matches: false, breakpoints: {} });

    breakpointObserver = {
      observe: vi.fn().mockReturnValue(breakpointSubject.asObservable()),
    };

    await TestBed.configureTestingModule({
      imports: [ShellComponent, NoopAnimationsModule],
      providers: [{ provide: BreakpointObserver, useValue: breakpointObserver }, provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have isHandset$ observable defined', () => {
      expect(component.isHandset$).toBeDefined();
    });

    it('should call breakpointObserver.observe on init', () => {
      expect(breakpointObserver.observe).toHaveBeenCalled();
    });
  });

  describe('Template Structure', () => {
    it('should render mat-sidenav-container', () => {
      const container = fixture.debugElement.query(By.css('mat-sidenav-container'));
      expect(container).toBeTruthy();
    });

    it('should render mat-sidenav', () => {
      const sidenav = fixture.debugElement.query(By.css('mat-sidenav'));
      expect(sidenav).toBeTruthy();
    });

    it('should render mat-sidenav-content', () => {
      const content = fixture.debugElement.query(By.css('mat-sidenav-content'));
      expect(content).toBeTruthy();
    });

    it('should render toolbar component', () => {
      const toolbar = fixture.debugElement.query(By.css('app-toolbar'));
      expect(toolbar).toBeTruthy();
    });

    it('should render sidenav component', () => {
      const sidenav = fixture.debugElement.query(By.css('app-sidenav'));
      expect(sidenav).toBeTruthy();
    });

    it('should render router outlet', () => {
      const outlet = fixture.debugElement.query(By.css('router-outlet'));
      expect(outlet).toBeTruthy();
    });
  });

  describe('Sidenav Behavior', () => {
    it('should have mat-sidenav element', () => {
      const sidenav = fixture.debugElement.query(By.css('mat-sidenav'));
      expect(sidenav).toBeTruthy();
    });

    it('should render sidenav component inside mat-sidenav', () => {
      const matSidenav = fixture.debugElement.query(By.css('mat-sidenav'));
      const appSidenav = matSidenav?.query(By.css('app-sidenav'));
      expect(appSidenav).toBeTruthy();
    });

    it('should have proper sidenav structure', () => {
      const container = fixture.debugElement.query(By.css('mat-sidenav-container'));
      const sidenav = container?.query(By.css('mat-sidenav'));
      const content = container?.query(By.css('mat-sidenav-content'));

      expect(container).toBeTruthy();
      expect(sidenav).toBeTruthy();
      expect(content).toBeTruthy();
    });
  });

  describe('Observable Pattern', () => {
    it('should use shareReplay for isHandset$ observable', async () => {
      // Subscribe multiple times
      const subscription1 = component.isHandset$.subscribe();
      const subscription2 = component.isHandset$.subscribe();

      // Should only call observe once due to shareReplay
      expect(breakpointObserver.observe).toHaveBeenCalledTimes(1);

      subscription1.unsubscribe();
      subscription2.unsubscribe();
    });

    it('should map breakpoint result to boolean', async () => {
      breakpointSubject.next({ matches: true, breakpoints: {} });

      let result: any;
      component.isHandset$.subscribe((value) => (result = value));

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(typeof result).toBe('boolean');
      expect(result).toBe(true);
    });
  });

  describe('Component Composition', () => {
    it('should use standalone component imports', () => {
      // Component should be standalone
      const metadata = (ShellComponent as any).ɵcmp;
      expect(metadata.standalone).toBe(true);
    });

    it('should have all required child components', () => {
      const toolbar = fixture.debugElement.query(By.css('app-toolbar'));
      const sidenav = fixture.debugElement.query(By.css('app-sidenav'));

      expect(toolbar).toBeTruthy();
      expect(sidenav).toBeTruthy();
    });
  });
});
