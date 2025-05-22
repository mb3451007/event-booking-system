import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideBarMobileComponent } from './side-bar-mobile.component';

describe('SideBarMobileComponent', () => {
  let component: SideBarMobileComponent;
  let fixture: ComponentFixture<SideBarMobileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SideBarMobileComponent]
    });
    fixture = TestBed.createComponent(SideBarMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
