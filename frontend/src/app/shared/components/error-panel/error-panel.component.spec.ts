import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorPanelComponent } from './error-panel.component';

describe('ErrorPanelComponent', () => {
  let component: ErrorPanelComponent;
  let fixture: ComponentFixture<ErrorPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErrorPanelComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
