import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicCfgComponent } from './basic-cfg.component';

describe('BasicCfgComponent', () => {
  let component: BasicCfgComponent;
  let fixture: ComponentFixture<BasicCfgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BasicCfgComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicCfgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
