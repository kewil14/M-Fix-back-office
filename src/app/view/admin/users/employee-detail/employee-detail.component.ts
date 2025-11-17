import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Observable, Subscription } from 'rxjs';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { selectEmployeeState } from 'src/app/core/core.state';
import { EmployeeResponseDto } from 'src/app/core/shared/dtos/employee-response-dto';
import { findEmployeeById } from 'src/app/core/shared/stores/employee/employee.actions';
import { EmployeeState } from 'src/app/core/shared/stores/employee/employee.state';
import { resendInvitation, resendInvitationOk, resendInvitationError } from 'src/app/core/shared/stores/authentification/authentification.actions';
import { ResendInvitationDto } from 'src/app/core/shared/dtos/resend-invitation-dto.modal';

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
  isResendingInvitation = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storeService: Store,
    private actionService: Actions
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

    // Écouter les actions de renvoi d'invitation
    this.subscriptions.push(
      this.actionService.pipe(ofType(resendInvitationOk)).subscribe(() => {
        this.isResendingInvitation = false;
      }),
      this.actionService.pipe(ofType(resendInvitationError)).subscribe(() => {
        this.isResendingInvitation = false;
      })
    );
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

  onResendInvitation(): void {
    if (!this.employee?.email || this.isResendingInvitation) {
      return;
    }

    this.isResendingInvitation = true;
    const resendInvitationDto: ResendInvitationDto = {
      email: this.employee.email
    };

    this.storeService.dispatch(resendInvitation({ resendInvitationDto }));
  }
}

