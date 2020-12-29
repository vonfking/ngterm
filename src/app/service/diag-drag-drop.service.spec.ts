import { TestBed } from '@angular/core/testing';

import { DiagDragDropService } from './diag-drag-drop.service';

describe('DiagDragDropService', () => {
  let service: DiagDragDropService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiagDragDropService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
