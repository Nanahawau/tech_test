import { TestBed } from '@angular/core/testing';

import { AudienceSelectorComponent } from './audience-selector.component';

describe('AudienceSelectorComponent', () => {
  let service: AudienceSelectorComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AudienceSelectorComponent);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
