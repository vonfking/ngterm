import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HostcardComponent } from './hostcard.component';

describe('HostcardComponent', () => {
  let component: HostcardComponent;
  let fixture: ComponentFixture<HostcardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HostcardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HostcardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
