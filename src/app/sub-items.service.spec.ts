import { TestBed } from '@angular/core/testing';

import { SubItemsService } from './sub-items.service';

describe('SubItemsService', () => {
  let service: SubItemsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubItemsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
