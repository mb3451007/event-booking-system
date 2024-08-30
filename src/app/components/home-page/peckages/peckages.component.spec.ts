import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeckagesComponent } from './peckages.component';

describe('PeckagesComponent', () => {
  let component: PeckagesComponent;
  let fixture: ComponentFixture<PeckagesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PeckagesComponent]
    });
    fixture = TestBed.createComponent(PeckagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
