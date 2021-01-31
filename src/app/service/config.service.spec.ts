import { TestBed } from '@angular/core/testing';

import { HostConfigService } from './config.service';

describe('HostConfigService', () => {
  let service: HostConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HostConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
