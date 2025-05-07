import { TestBed } from '@angular/core/testing';

import { BookingItemsServiceService } from './booking-items-service.service';

describe('BookingItemsServiceService', () => {
  let service: BookingItemsServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookingItemsServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
