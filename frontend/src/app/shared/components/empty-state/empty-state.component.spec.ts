import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptySpaceComponent } from './empty-state.component';

describe('EmptySpaceComponent', () => {
  let component: EmptySpaceComponent;
  let fixture: ComponentFixture<EmptySpaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptySpaceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmptySpaceComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
