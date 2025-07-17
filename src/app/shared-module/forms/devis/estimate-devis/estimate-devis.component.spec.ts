/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EstimateDevisComponent } from './estimate-devis.component';

describe('EstimateDevisComponent', () => {
  let component: EstimateDevisComponent;
  let fixture: ComponentFixture<EstimateDevisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EstimateDevisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EstimateDevisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
