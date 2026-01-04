import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CsvErrorDialogComponent } from './csv-error-dialog.component';

describe('CsvErrorDialogComponent', () => {
  let component: CsvErrorDialogComponent;
  let fixture: ComponentFixture<CsvErrorDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CsvErrorDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CsvErrorDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
