import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermCfgComponent } from './term-cfg.component';

describe('TermCfgComponent', () => {
  let component: TermCfgComponent;
  let fixture: ComponentFixture<TermCfgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TermCfgComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TermCfgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
