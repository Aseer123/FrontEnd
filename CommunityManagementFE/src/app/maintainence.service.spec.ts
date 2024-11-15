import { TestBed } from '@angular/core/testing';

import { MaintainenceService } from './maintainence.service';

describe('MaintainenceService', () => {
  let service: MaintainenceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MaintainenceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
