import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountExplorerComponent } from './accounts-explorer.component';

describe('AccountExplorerComponent', () => {
  let component: AccountExplorerComponent;
  let fixture: ComponentFixture<AccountExplorerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountExplorerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountExplorerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
