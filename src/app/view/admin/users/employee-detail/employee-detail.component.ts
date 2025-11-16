import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { selectEmployeeState } from 'src/app/core/core.state';
import { EmployeeResponseDto } from 'src/app/core/shared/dtos/employee-response-dto';
import { findEmployeeById } from 'src/app/core/shared/stores/employee/employee.actions';
import { EmployeeState } from 'src/app/core/shared/stores/employee/employee.state';

@Component({
  selector: 'app-employee-detail',
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.scss']
})
export class EmployeeDetailComponent implements OnInit, OnDestroy {
  employeeState$!: Observable<EmployeeState>;
  employee: EmployeeResponseDto | null = null;
  employeeId: string | null = null;
  subscriptions: Subscription[] = [];
  dataStateEnum: typeof DataStateEnum = DataStateEnum;
  breadCrumbItems: Array<{}> = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storeService: Store
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Admin' },
      { label: 'Employés', routerLink: '/admin/employees' },
      { label: 'Détail', active: true }
    ];
    
    this.employeeState$ = this.storeService.select(selectEmployeeState).pipe();
    this.route.paramMap.subscribe(params => {
      this.employeeId = params.get('id');
      if (this.employeeId) {
        this.loadEmployee();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadEmployee(): void {
    if (this.employeeId) {
      this.storeService.dispatch(findEmployeeById({ employeeId: this.employeeId }));
    }
    
    this.subscriptions.push(
      this.employeeState$.subscribe(state => {
        if (state.dataState === DataStateEnum.SUCCESS && state.employee) {
          this.employee = state.employee;
        }
      })
    );
  }

  onEdit(): void {
    if (this.employeeId) {
      this.router.navigate(['/admin/employees/edit', this.employeeId]);
    }
  }

  onBack(): void {
    this.router.navigate(['/admin/employees']);
  }
}

