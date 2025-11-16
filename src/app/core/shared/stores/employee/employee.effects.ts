import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { RequestResultDto } from '../../dtos/request-result-dto.modal';
import { EmployeeService } from '../../services/employee.service';
import { NotificationService } from '../../services/notification.service';
import { isCriticalHttpError } from '../../utils/error-handler.util';
import {
  findAllEmployees,
  findEmployeeById,
  createEmployeeNew,
  updateEmployee,
  deleteEmployee,
  reactivateEmployee,
  erreurEmployees,
  setEmployee,
  addEmployee,
  loadEmployees,
  removeEmployee
} from './employee.actions';

@Injectable()
export class EmployeeEffects {
  constructor(
    private actions$: Actions,
    private employeeService: EmployeeService,
    private storeService: Store,
    private translateService: TranslateService,
    private notificationService: NotificationService
  ) {}

  findAllEmployeesEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(findAllEmployees),
      mergeMap(({ filters }) =>
        this.employeeService.findAllEmployees(filters).pipe(
          map((data: RequestResultDto<any>) => {
            if (data.status === 'SUCCESS' && data.data) {
              return loadEmployees({
                employees: data.data.content || [],
                totalElements: data.data.totalElements || 0,
                totalPages: data.data.totalPages || 0,
                currentPage: data.data.number || 0,
                pageSize: data.data.size || 10
              });
            } else {
              return erreurEmployees({
                messages: data.message || 'Erreur lors de la récupération des employés'
              });
            }
          }),
          catchError((error) => {
            if (isCriticalHttpError(error)) {
              throw error;
            }
            const errorMessage =
              error?.error?.message ||
              error?.message ||
              this.translateService.instant('MESSAGES.ERRORS.LOAD');
            return of(erreurEmployees({ messages: errorMessage }));
          })
        )
      )
    )
  );

  findEmployeeByIdEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(findEmployeeById),
      mergeMap(({ employeeId }) =>
        this.employeeService.findEmployeeById(employeeId).pipe(
          map((data: RequestResultDto<any>) => {
            if (data.status === 'SUCCESS' && data.data) {
              return setEmployee({ employee: data.data });
            } else {
              return erreurEmployees({
                messages: data.message || "Erreur lors de la récupération de l'employé"
              });
            }
          }),
          catchError((error) => {
            if (isCriticalHttpError(error)) {
              throw error;
            }
            const errorMessage =
              error?.error?.message ||
              error?.message ||
              this.translateService.instant('MESSAGES.ERRORS.LOAD');
            return of(erreurEmployees({ messages: errorMessage }));
          })
        )
      )
    )
  );

  createEmployeeNewEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(createEmployeeNew),
      mergeMap(({ createEmployeeDto }) =>
        this.employeeService.createEmployee(createEmployeeDto).pipe(
          map((data: RequestResultDto<any>) => {
            if (data.status === 'SUCCESS' && data.data) {
              this.notificationService.showSuccess(
                "Employé créé avec succès! Un email d'invitation a été envoyé."
              );
              return addEmployee({ employee: data.data });
            } else {
              const errorMsg = data.message || "Erreur lors de la création de l'employé";
              this.notificationService.showError(errorMsg);
              return erreurEmployees({ messages: errorMsg });
            }
          }),
          catchError((error) => {
            if (isCriticalHttpError(error)) {
              throw error;
            }
            const errorMessage =
              error?.error?.message ||
              error?.message ||
              this.translateService.instant('MESSAGES.ERRORS.LOAD');
            this.notificationService.showError(errorMessage);
            return of(erreurEmployees({ messages: errorMessage }));
          })
        )
      )
    )
  );

  updateEmployeeEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(updateEmployee),
      mergeMap(({ employeeId, updateEmployeeDto }) =>
        this.employeeService.updateEmployee(employeeId, updateEmployeeDto).pipe(
          map((data: RequestResultDto<any>) => {
            if (data.status === 'SUCCESS' && data.data) {
              this.notificationService.showSuccess('Employé mis à jour avec succès!');
              return setEmployee({ employee: data.data });
            } else {
              const errorMsg = data.message || "Erreur lors de la mise à jour de l'employé";
              this.notificationService.showError(errorMsg);
              return erreurEmployees({ messages: errorMsg });
            }
          }),
          catchError((error) => {
            if (isCriticalHttpError(error)) {
              throw error;
            }
            const errorMessage =
              error?.error?.message ||
              error?.message ||
              this.translateService.instant('MESSAGES.ERRORS.LOAD');
            this.notificationService.showError(errorMessage);
            return of(erreurEmployees({ messages: errorMessage }));
          })
        )
      )
    )
  );

  deleteEmployeeEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteEmployee),
      mergeMap(({ employeeId }) =>
        this.employeeService.deleteEmployee(employeeId).pipe(
          map((data: RequestResultDto<any>) => {
            if (data.status === 'SUCCESS') {
              this.notificationService.showSuccess('Employé désactivé avec succès!');
              return removeEmployee({ employeeId });
            } else {
              const errorMsg = data.message || "Erreur lors de la suppression de l'employé";
              this.notificationService.showError(errorMsg);
              return erreurEmployees({ messages: errorMsg });
            }
          }),
          catchError((error) => {
            if (isCriticalHttpError(error)) {
              throw error;
            }
            const errorMessage =
              error?.error?.message ||
              error?.message ||
              this.translateService.instant('MESSAGES.ERRORS.LOAD');
            this.notificationService.showError(errorMessage);
            return of(erreurEmployees({ messages: errorMessage }));
          })
        )
      )
    )
  );

  reactivateEmployeeEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(reactivateEmployee),
      mergeMap(({ employeeId }) =>
        this.employeeService.reactivateEmployee(employeeId).pipe(
          map((data: RequestResultDto<any>) => {
            if (data.status === 'SUCCESS') {
              this.notificationService.showSuccess('Employé réactivé avec succès!');
              return findEmployeeById({ employeeId });
            } else {
              const errorMsg = data.message || "Erreur lors de la réactivation de l'employé";
              this.notificationService.showError(errorMsg);
              return erreurEmployees({ messages: errorMsg });
            }
          }),
          catchError((error) => {
            if (isCriticalHttpError(error)) {
              throw error;
            }
            const errorMessage =
              error?.error?.message ||
              error?.message ||
              this.translateService.instant('MESSAGES.ERRORS.LOAD');
            this.notificationService.showError(errorMessage);
            return of(erreurEmployees({ messages: errorMessage }));
          })
        )
      )
    )
  );
}
