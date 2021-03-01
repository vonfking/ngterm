import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseTermTabComponent } from './base-term-tab.component';

describe('BaseTermTabComponent', () => {
  let component: BaseTermTabComponent;
  let fixture: ComponentFixture<BaseTermTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BaseTermTabComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseTermTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
