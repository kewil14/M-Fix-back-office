import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSuperAdminComponent } from './create-superadmin.component';

describe('CreateSuperAdminComponent', () => {
  let component: CreateSuperAdminComponent;
  let fixture: ComponentFixture<CreateSuperAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateSuperAdminComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateSuperAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

