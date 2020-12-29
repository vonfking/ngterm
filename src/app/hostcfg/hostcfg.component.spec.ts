import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HostcfgComponent } from './hostcfg.component';

describe('HostcfgComponent', () => {
  let component: HostcfgComponent;
  let fixture: ComponentFixture<HostcfgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HostcfgComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HostcfgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
