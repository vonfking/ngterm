import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HostcfgComponent2 } from './hostcfg.component';

describe('HostcfgComponent2', () => {
  let component: HostcfgComponent2;
  let fixture: ComponentFixture<HostcfgComponent2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HostcfgComponent2 ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HostcfgComponent2);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
