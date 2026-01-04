import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadershipSummaryComponent } from './leadership-summary.component';

describe('LeadershipSummaryComponent', () => {
  let component: LeadershipSummaryComponent;
  let fixture: ComponentFixture<LeadershipSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeadershipSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeadershipSummaryComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
