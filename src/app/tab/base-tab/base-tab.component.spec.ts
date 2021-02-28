import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseTabComponent } from './base-tab.component';

describe('BaseTabComponent', () => {
  let component: BaseTabComponent;
  let fixture: ComponentFixture<BaseTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BaseTabComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
