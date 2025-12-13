import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { RequestResultDto } from '../../dtos/request-result-dto.modal';
import { WorkspaceAdminService } from '../../services/workspace-admin.service';
import { NotificationService } from '../../services/notification.service';
import { isCriticalHttpError } from '../../utils/error-handler.util'; // Keep this import for now, but it won't be used in catchError
import {
  findAllWorkspaceAdmins,
  findWorkspaceAdminById,
  updateWorkspaceAdmin,
  deleteWorkspaceAdmin,
  reactivateWorkspaceAdmin,
  erreurWorkspaceAdmins,
  setWorkspaceAdmin,
  addWorkspaceAdmin,
  loadWorkspaceAdmins,
  removeWorkspaceAdmin
} from './workspace-admin.actions';

@Injectable()
export class WorkspaceAdminEffects {
  constructor(
    private actions$: Actions,
    private workspaceAdminService: WorkspaceAdminService,
    private storeService: Store,
    private translateService: TranslateService,
    private notificationService: NotificationService
  ) {}

  findAllWorkspaceAdminsEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(findAllWorkspaceAdmins),
      mergeMap(({ filters }) =>
        this.workspaceAdminService.findAllWorkspaceAdmins(filters).pipe(
          map((data: RequestResultDto<any>) => {
            if (data.status === 'SUCCESS' && data.data) {
              return loadWorkspaceAdmins({
                workspaceAdmins: data.data.content || [],
                totalElements: data.data.totalElements || 0,
                totalPages: data.data.totalPages || 0,
                currentPage: data.data.number || 0,
                pageSize: data.data.size || 10
              });
            } else {
              return erreurWorkspaceAdmins({
                messages: data.message || 'Erreur lors de la récupération des workspace admins'
              });
            }
          }),
          catchError((error) => {
            let errorMessage = this.translateService.instant('MESSAGES.ERRORS.LOAD');
            if (error.status === 403) {
              errorMessage = this.translateService.instant('MESSAGES.ERRORS.FORBIDDEN_ACCESS');
            } else if (error.status === 401) {
              errorMessage = this.translateService.instant('MESSAGES.ERRORS.UNAUTHORIZED_ACCESS');
            } else if (error?.error?.message) {
              errorMessage = error.error.message;
            } else if (error?.message) {
              errorMessage = error.message;
            }
            this.notificationService.showError(errorMessage);
            return of(erreurWorkspaceAdmins({ messages: errorMessage }));
          })
        )
      )
    )
  );

  findWorkspaceAdminByIdEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(findWorkspaceAdminById),
      mergeMap(({ workspaceAdminId }) =>
        this.workspaceAdminService.findWorkspaceAdminById(workspaceAdminId).pipe(
          map((data: RequestResultDto<any>) => {
            if (data.status === 'SUCCESS' && data.data) {
              return setWorkspaceAdmin({ workspaceAdmin: data.data });
            } else {
              return erreurWorkspaceAdmins({
                messages: data.message || "Erreur lors de la récupération du workspace admin"
              });
            }
          }),
          catchError((error) => {
            let errorMessage = this.translateService.instant('MESSAGES.ERRORS.LOAD');
            if (error.status === 403) {
              errorMessage = this.translateService.instant('MESSAGES.ERRORS.FORBIDDEN_ACCESS');
            } else if (error.status === 401) {
              errorMessage = this.translateService.instant('MESSAGES.ERRORS.UNAUTHORIZED_ACCESS');
            } else if (error?.error?.message) {
              errorMessage = error.error.message;
            } else if (error?.message) {
              errorMessage = error.message;
            }
            this.notificationService.showError(errorMessage);
            return of(erreurWorkspaceAdmins({ messages: errorMessage }));
          })
        )
      )
    )
  );

  updateWorkspaceAdminEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(updateWorkspaceAdmin),
      mergeMap(({ workspaceAdminId, updateWorkspaceAdminDto }) =>
        this.workspaceAdminService.updateWorkspaceAdmin(workspaceAdminId, updateWorkspaceAdminDto).pipe(
          map((data: RequestResultDto<any>) => {
            if (data.status === 'SUCCESS' && data.data) {
              this.notificationService.showSuccess(
                "Workspace admin mis à jour avec succès!"
              );
              return setWorkspaceAdmin({ workspaceAdmin: data.data });
            } else {
              const errorMsg = data.message || "Erreur lors de la mise à jour du workspace admin";
              this.notificationService.showError(errorMsg);
              return erreurWorkspaceAdmins({ messages: errorMsg });
            }
          }),
          catchError((error) => {
            let errorMessage = this.translateService.instant('MESSAGES.ERRORS.LOAD');
            if (error.status === 403) {
              errorMessage = this.translateService.instant('MESSAGES.ERRORS.FORBIDDEN_ACCESS');
            } else if (error.status === 401) {
              errorMessage = this.translateService.instant('MESSAGES.ERRORS.UNAUTHORIZED_ACCESS');
            } else if (error?.error?.message) {
              errorMessage = error.error.message;
            } else if (error?.message) {
              errorMessage = error.message;
            }
            this.notificationService.showError(errorMessage);
            return of(erreurWorkspaceAdmins({ messages: errorMessage }));
          })
        )
      )
    )
  );

  deleteWorkspaceAdminEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteWorkspaceAdmin),
      mergeMap(({ workspaceAdminId }) =>
        this.workspaceAdminService.deleteWorkspaceAdmin(workspaceAdminId).pipe(
          map((data: RequestResultDto<any>) => {
            if (data.status === 'SUCCESS') {
              this.notificationService.showSuccess(
                "Workspace admin désactivé avec succès!"
              );
              return removeWorkspaceAdmin({ workspaceAdminId });
            } else {
              const errorMsg = data.message || "Erreur lors de la désactivation du workspace admin";
              this.notificationService.showError(errorMsg);
              return erreurWorkspaceAdmins({ messages: errorMsg });
            }
          }),
          catchError((error) => {
            let errorMessage = this.translateService.instant('MESSAGES.ERRORS.LOAD');
            if (error.status === 403) {
              errorMessage = this.translateService.instant('MESSAGES.ERRORS.FORBIDDEN_ACCESS');
            } else if (error.status === 401) {
              errorMessage = this.translateService.instant('MESSAGES.ERRORS.UNAUTHORIZED_ACCESS');
            } else if (error?.error?.message) {
              errorMessage = error.error.message;
            } else if (error?.message) {
              errorMessage = error.message;
            }
            this.notificationService.showError(errorMessage);
            return of(erreurWorkspaceAdmins({ messages: errorMessage }));
          })
        )
      )
    )
  );

  reactivateWorkspaceAdminEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(reactivateWorkspaceAdmin),
      mergeMap(({ workspaceAdminId }) =>
        this.workspaceAdminService.reactivateWorkspaceAdmin(workspaceAdminId).pipe(
          map((data: RequestResultDto<any>) => {
            if (data.status === 'SUCCESS') {
              this.notificationService.showSuccess(
                "Workspace admin réactivé avec succès!"
              );
              return findWorkspaceAdminById({ workspaceAdminId });
            } else {
              const errorMsg = data.message || "Erreur lors de la réactivation du workspace admin";
              this.notificationService.showError(errorMsg);
              return erreurWorkspaceAdmins({ messages: errorMsg });
            }
          }),
          catchError((error) => {
            let errorMessage = this.translateService.instant('MESSAGES.ERRORS.LOAD');
            if (error.status === 403) {
              errorMessage = this.translateService.instant('MESSAGES.ERRORS.FORBIDDEN_ACCESS');
            } else if (error.status === 401) {
              errorMessage = this.translateService.instant('MESSAGES.ERRORS.UNAUTHORIZED_ACCESS');
            } else if (error?.error?.message) {
              errorMessage = error.error.message;
            } else if (error?.message) {
              errorMessage = error.message;
            }
            this.notificationService.showError(errorMessage);
            return of(erreurWorkspaceAdmins({ messages: errorMessage }));
          })
        )
      )
    )
  );
}