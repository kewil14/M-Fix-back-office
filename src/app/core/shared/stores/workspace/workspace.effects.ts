import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { RequestResultDto } from '../../dtos/request-result-dto.modal';
import { WorkspaceService } from '../../services/workspace.service';
import { NotificationService } from '../../services/notification.service';
import { isCriticalHttpError } from '../../utils/error-handler.util';
import {
  findAllWorkspaces,
  findWorkspaceById,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  reactivateWorkspace,
  erreurWorkspaces,
  setWorkspace,
  addWorkspace,
  loadWorkspaces,
  removeWorkspace
} from './workspace.actions';

@Injectable()
export class WorkspaceEffects {
  constructor(
    private actions$: Actions,
    private workspaceService: WorkspaceService,
    private storeService: Store,
    private translateService: TranslateService,
    private notificationService: NotificationService
  ) {}

  findAllWorkspacesEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(findAllWorkspaces),
      mergeMap(({ filters }) =>
        this.workspaceService.getWorkspaces(filters).pipe(
          map((data: RequestResultDto<any>) => {
            if (data.status === 'SUCCESS' && data.data) {
              return loadWorkspaces({
                workspaces: data.data.content || [],
                totalElements: data.data.totalElements || 0,
                totalPages: data.data.totalPages || 0,
                currentPage: data.data.number || 0,
                pageSize: data.data.size || 10
              });
            } else {
              return erreurWorkspaces({
                messages: data.message || 'Erreur lors de la récupération des workspaces'
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
            return of(erreurWorkspaces({ messages: errorMessage }));
          })
        )
      )
    )
  );

  findWorkspaceByIdEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(findWorkspaceById),
      mergeMap(({ workspaceId }) =>
        this.workspaceService.getWorkspaceById(workspaceId).pipe(
          map((data: RequestResultDto<any>) => {
            if (data.status === 'SUCCESS' && data.data) {
              return setWorkspace({ workspace: data.data });
            } else {
              return erreurWorkspaces({
                messages: data.message || "Erreur lors de la récupération du workspace"
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
            return of(erreurWorkspaces({ messages: errorMessage }));
          })
        )
      )
    )
  );

  createWorkspaceEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(createWorkspace),
      mergeMap(({ createWorkspaceDto }) =>
        this.workspaceService.createWorkspace(createWorkspaceDto).pipe(
          map((data: RequestResultDto<any>) => {
            if (data.status === 'SUCCESS' && data.data) {
              this.notificationService.showSuccess('Workspace créé avec succès!');
              return addWorkspace({ workspace: data.data });
            } else {
              return erreurWorkspaces({
                messages: data.message || "Erreur lors de la création du workspace"
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
              this.translateService.instant('MESSAGES.ERRORS.SAVE');
            this.notificationService.showError(errorMessage);
            return of(erreurWorkspaces({ messages: errorMessage }));
          })
        )
      )
    )
  );

  updateWorkspaceEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(updateWorkspace),
      mergeMap(({ workspaceId, updateWorkspaceDto }) =>
        this.workspaceService.updateWorkspace(workspaceId, updateWorkspaceDto).pipe(
          map((data: RequestResultDto<any>) => {
            if (data.status === 'SUCCESS' && data.data) {
              this.notificationService.showSuccess('Workspace mis à jour avec succès!');
              return setWorkspace({ workspace: data.data });
            } else {
              return erreurWorkspaces({
                messages: data.message || "Erreur lors de la mise à jour du workspace"
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
              this.translateService.instant('MESSAGES.ERRORS.UPDATE');
            this.notificationService.showError(errorMessage);
            return of(erreurWorkspaces({ messages: errorMessage }));
          })
        )
      )
    )
  );

  deleteWorkspaceEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteWorkspace),
      mergeMap(({ workspaceId }) =>
        this.workspaceService.deleteWorkspace(workspaceId).pipe(
          map((data: RequestResultDto<any>) => {
            if (data.status === 'SUCCESS') {
              this.notificationService.showSuccess('Workspace désactivé avec succès!');
              return removeWorkspace({ workspaceId });
            } else {
              return erreurWorkspaces({
                messages: data.message || "Erreur lors de la désactivation du workspace"
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
              this.translateService.instant('MESSAGES.ERRORS.DELETE');
            this.notificationService.showError(errorMessage);
            return of(erreurWorkspaces({ messages: errorMessage }));
          })
        )
      )
    )
  );

  reactivateWorkspaceEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(reactivateWorkspace),
      mergeMap(({ workspaceId }) =>
        this.workspaceService.reactivateWorkspace(workspaceId).pipe(
          map((data: RequestResultDto<any>) => {
            if (data.status === 'SUCCESS') {
              this.notificationService.showSuccess('Workspace réactivé avec succès!');
              return findWorkspaceById({ workspaceId });
            } else {
              return erreurWorkspaces({
                messages: data.message || "Erreur lors de la réactivation du workspace"
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
              this.translateService.instant('MESSAGES.ERRORS.UPDATE');
            this.notificationService.showError(errorMessage);
            return of(erreurWorkspaces({ messages: errorMessage }));
          })
        )
      )
    )
  );
}

