import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { RequestResultDto } from '../../dtos/request-result-dto.modal';
import { AdminService } from '../../services/admin.service';
import { NotificationService } from '../../services/notification.service';
import { isCriticalHttpError } from '../../utils/error-handler.util';
import {
  findAllAdmins,
  findAdminById,
  createAdminNew,
  updateAdmin,
  deleteAdmin,
  reactivateAdmin,
  erreurAdmins,
  setAdmin,
  addAdmin,
  loadAdmins,
  removeAdmin
} from './admin.actions';

@Injectable()
export class AdminEffects {
  constructor(
    private actions$: Actions,
    private adminService: AdminService,
    private storeService: Store,
    private translateService: TranslateService,
    private notificationService: NotificationService
  ) {}

  findAllAdminsEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(findAllAdmins),
      mergeMap(({ filters }) =>
        this.adminService.findAllAdmins(filters).pipe(
          map((data: RequestResultDto<any>) => {
            if (data.status === 'SUCCESS' && data.data) {
              return loadAdmins({
                admins: data.data.content || [],
                totalElements: data.data.totalElements || 0,
                totalPages: data.data.totalPages || 0,
                currentPage: data.data.number || 0,
                pageSize: data.data.size || 10
              });
            } else {
              return erreurAdmins({
                messages: data.message || 'Erreur lors de la récupération des administrateurs'
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
            return of(erreurAdmins({ messages: errorMessage }));
          })
        )
      )
    )
  );

  findAdminByIdEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(findAdminById),
      mergeMap(({ adminId }) =>
        this.adminService.findAdminById(adminId).pipe(
          map((data: RequestResultDto<any>) => {
            if (data.status === 'SUCCESS' && data.data) {
              return setAdmin({ admin: data.data });
            } else {
              return erreurAdmins({
                messages: data.message || "Erreur lors de la récupération de l'administrateur"
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
            return of(erreurAdmins({ messages: errorMessage }));
          })
        )
      )
    )
  );

  createAdminNewEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(createAdminNew),
      mergeMap(({ createAdminDto }) =>
        this.adminService.createAdmin(createAdminDto).pipe(
          map((data: RequestResultDto<any>) => {
            if (data.status === 'SUCCESS' && data.data) {
              this.notificationService.showSuccess(
                "Administrateur créé avec succès! Un email d'invitation a été envoyé."
              );
              return addAdmin({ admin: data.data });
            } else {
              const errorMsg = data.message || "Erreur lors de la création de l'administrateur";
              this.notificationService.showError(errorMsg);
              return erreurAdmins({ messages: errorMsg });
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
            return of(erreurAdmins({ messages: errorMessage }));
          })
        )
      )
    )
  );

  updateAdminEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(updateAdmin),
      mergeMap(({ adminId, updateAdminDto }) =>
        this.adminService.updateAdmin(adminId, updateAdminDto).pipe(
          map((data: RequestResultDto<any>) => {
            if (data.status === 'SUCCESS' && data.data) {
              this.notificationService.showSuccess('Administrateur mis à jour avec succès!');
              this.storeService.dispatch(findAllAdmins({ filters: {} }));
              return setAdmin({ admin: data.data });
            } else {
              const errorMsg = data.message || "Erreur lors de la mise à jour de l'administrateur";
              this.notificationService.showError(errorMsg);
              return erreurAdmins({ messages: errorMsg });
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
            return of(erreurAdmins({ messages: errorMessage }));
          })
        )
      )
    )
  );

  deleteAdminEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteAdmin),
      mergeMap(({ adminId }) =>
        this.adminService.deleteAdmin(adminId).pipe(
          map((data: RequestResultDto<any>) => {
            if (data.status === 'SUCCESS') {
              this.notificationService.showSuccess('Administrateur désactivé avec succès!');
              this.storeService.dispatch(findAllAdmins({ filters: {} }));
              return removeAdmin({ adminId });
            } else {
              const errorMsg = data.message || "Erreur lors de la suppression de l'administrateur";
              this.notificationService.showError(errorMsg);
              return erreurAdmins({ messages: errorMsg });
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
            return of(erreurAdmins({ messages: errorMessage }));
          })
        )
      )
    )
  );

  reactivateAdminEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(reactivateAdmin),
      mergeMap(({ adminId }) =>
        this.adminService.reactivateAdmin(adminId).pipe(
          map((data: RequestResultDto<any>) => {
            if (data.status === 'SUCCESS') {
              this.notificationService.showSuccess('Administrateur réactivé avec succès!');
              this.storeService.dispatch(findAdminById({ adminId }));
              this.storeService.dispatch(findAllAdmins({ filters: {} }));
              return setAdmin({ admin: {} as any });
            } else {
              const errorMsg = data.message || "Erreur lors de la réactivation de l'administrateur";
              this.notificationService.showError(errorMsg);
              return erreurAdmins({ messages: errorMsg });
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
            return of(erreurAdmins({ messages: errorMessage }));
          })
        )
      )
    )
  );
}
