import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionListCardComponent } from './action-list-card.component';

describe('ActionListCardComponent', () => {
  let component: ActionListCardComponent;
  let fixture: ComponentFixture<ActionListCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionListCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionListCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
