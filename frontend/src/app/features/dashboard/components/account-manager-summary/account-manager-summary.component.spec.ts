import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountManagerSummaryComponent } from './account-manager-summary.component';

describe('AccountManagerSummaryComponent', () => {
  let component: AccountManagerSummaryComponent;
  let fixture: ComponentFixture<AccountManagerSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountManagerSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountManagerSummaryComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
