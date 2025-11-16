import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateWorkspaceAdminComponent } from './create-workspace-admin.component';

describe('CreateWorkspaceAdminComponent', () => {
  let component: CreateWorkspaceAdminComponent;
  let fixture: ComponentFixture<CreateWorkspaceAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateWorkspaceAdminComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateWorkspaceAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

