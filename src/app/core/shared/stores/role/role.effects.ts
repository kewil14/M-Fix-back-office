import { TranslateService } from '@ngx-translate/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { RoleResponseDto } from '../../dtos/role-response-dto';
import { RequestResultDto } from '../../dtos/request-result-dto.modal';
import { RoleService } from '../../services/role.service';
import { NotificationService } from '../../services/notification.service';
import { AutorisationResponseDto } from '../../dtos/autorisation-response-dto';
import {
  setRole,
  deleteRole,
  addRole,
  loadRole,
  erreurRoles,
  setRoleItem,
  loadRoleItem,
  findAllRoleItem,
  findAllRolesSaasAdmin,
  findAllRoleItemSaas,
  getAvailablePermissions,
  assignRoleToUser,
  revokeRoleFromUser,
  updateRolePermissionsAction,
  createRoleNew,
  findAvailableRoles,
  createRoleSaasAdmin
} from './role.actions';

@Injectable()
export class RolesEffects {
  constructor(
    private actions$: Actions,
    private translateService: TranslateService,
    private storeService: Store,
    private roleService: RoleService,
    private notificationService: NotificationService
  ) {}

  createRoleSaasAdmin = createEffect(() =>
    this.actions$.pipe(
      ofType(createRoleSaasAdmin),
      mergeMap(({ role }) => this.parseAddRole(this.roleService.createRole(role)))
    )
  );

  findAllRoleItem = createEffect(() =>
    this.actions$.pipe(
      ofType(findAllRoleItem),
      mergeMap(() => this.parseLoadRoleItem(this.roleService.findAllRoleItem()))
    )
  );

  findAllRoleSaasAdmin = createEffect(() =>
    this.actions$.pipe(
      ofType(findAllRolesSaasAdmin),
      mergeMap(() => this.parseLoadRoleItem(this.roleService.findAllRoleSaasAdmin()))
    )
  );

  findAllRoleItemSaas = createEffect(() =>
    this.actions$.pipe(
      ofType(findAllRoleItemSaas),
      mergeMap(() => this.parseLoadRoleItem(this.roleService.findAllRoleItemSaas()))
    )
  );

  findAvailableRolesEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(findAvailableRoles),
      mergeMap(({ workspaceId, shopId }) =>
        this.roleService.findAvailableRoles(workspaceId, shopId).pipe(
          map((data: RequestResultDto<any>) => {
            if (data.status === 'SUCCESS') {
              const roles = (data.data?.roles || []).map((role: any) => ({
                id: role.id,
                roleCode: role.code,
                code: role.code,
                roleName: role.name,
                name: role.name,
                roleDescription: role.description,
                description: role.description,
                workspaceId: role.workspaceId,
                isSystemRole: role.isSystemRole,
                priority: role.priority,
                permissions: role.permissions,
                createdAt: role.createdAt
              }));
              return loadRole({ roles: roles });
            } else {
              return erreurRoles({
                messages: data.message || 'Erreur lors de la récupération des rôles'
              });
            }
          }),
          catchError(() =>
            of(erreurRoles({ messages: this.translateService.instant('MESSAGES.ERRORS.LOAD') }))
          )
        )
      )
    )
  );

  deleteRoleEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteRole),
      mergeMap(({ role }) => {
        const idRole = (role as any).id || role.roleCode || role.code || '';
        if (!idRole) {
          this.notificationService.showError('Identifiant du rôle manquant');
          return of(erreurRoles({ messages: 'Identifiant du rôle manquant' }));
        }
        return this.roleService.deleteRole(idRole).pipe(
          map((data: RequestResultDto<any>) => {
            if (data.status === 'SUCCESS') {
              this.notificationService.showSuccess('Rôle supprimé avec succès!');
              this.storeService.dispatch(findAvailableRoles({}));
              return loadRole({ roles: [] });
            } else {
              const errorMsg = data.message || 'Erreur lors de la suppression';
              this.notificationService.showError(errorMsg);
              return erreurRoles({ messages: errorMsg });
            }
          }),
          catchError((error) => {
            const errorMessage =
              error?.error?.message ||
              error?.message ||
              this.translateService.instant('MESSAGES.ERRORS.LOAD');
            this.notificationService.showError(errorMessage);
            return of(erreurRoles({ messages: errorMessage }));
          })
        );
      })
    )
  );

  getAvailablePermissionsEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(getAvailablePermissions),
      mergeMap(() =>
        this.roleService.getAvailablePermissions().pipe(
          map((data: RequestResultDto<any>) => {
            if (data.status === 'SUCCESS') {
              return loadRoleItem({ roleItems: data.data?.permissions || [] });
            } else {
              return erreurRoles({
                messages: data.message || 'Erreur lors de la récupération des permissions'
              });
            }
          }),
          catchError(() =>
            of(erreurRoles({ messages: this.translateService.instant('MESSAGES.ERRORS.LOAD') }))
          )
        )
      )
    )
  );

  assignRoleToUserEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(assignRoleToUser),
      mergeMap(({ assignRequest }) =>
        this.roleService.assignRole(assignRequest).pipe(
          map((data: RequestResultDto<any>) => {
            if (data.status === 'SUCCESS') {
              return setRoleItem({ roleItem: {} });
            } else {
              return erreurRoles({
                messages: data.message || "Erreur lors de l'assignation du rôle"
              });
            }
          }),
          catchError(() =>
            of(erreurRoles({ messages: this.translateService.instant('MESSAGES.ERRORS.LOAD') }))
          )
        )
      )
    )
  );

  revokeRoleFromUserEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(revokeRoleFromUser),
      mergeMap(({ targetUserId, roleId, workspaceId }) =>
        this.roleService.revokeRole(targetUserId, roleId, workspaceId).pipe(
          map((data: RequestResultDto<any>) => {
            if (data.status === 'SUCCESS') {
              return setRoleItem({ roleItem: {} });
            } else {
              return erreurRoles({
                messages: data.message || 'Erreur lors de la révocation du rôle'
              });
            }
          }),
          catchError(() =>
            of(erreurRoles({ messages: this.translateService.instant('MESSAGES.ERRORS.LOAD') }))
          )
        )
      )
    )
  );

  updateRolePermissionsEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(updateRolePermissionsAction),
      mergeMap(({ roleId, permissions }) =>
        this.roleService.updateRolePermissions(roleId, permissions).pipe(
          map((data: RequestResultDto<any>) => {
            if (data.status === 'SUCCESS') {
              this.notificationService.showSuccess('Permissions mises à jour avec succès!');
              this.storeService.dispatch(findAvailableRoles({}));
              return setRole({ role: data.data });
            } else {
              const errorMsg = data.message || 'Erreur lors de la mise à jour des permissions';
              this.notificationService.showError(errorMsg);
              return erreurRoles({ messages: errorMsg });
            }
          }),
          catchError((error) => {
            const errorMessage =
              error?.error?.message ||
              error?.message ||
              this.translateService.instant('MESSAGES.ERRORS.LOAD');
            this.notificationService.showError(errorMessage);
            return of(erreurRoles({ messages: errorMessage }));
          })
        )
      )
    )
  );

  createRoleNewEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(createRoleNew),
      mergeMap(({ role }) =>
        this.roleService.createRoleNew(role).pipe(
          map((data: RequestResultDto<any>) => {
            if (data.status === 'SUCCESS') {
              this.notificationService.showSuccess('Rôle créé avec succès!');
              this.storeService.dispatch(findAvailableRoles({}));
              return addRole({ role: data.data });
            } else {
              const errorMsg = data.message || 'Erreur lors de la création du rôle';
              this.notificationService.showError(errorMsg);
              return erreurRoles({ messages: errorMsg });
            }
          }),
          catchError((error) => {
            const errorMessage =
              error?.error?.message ||
              error?.message ||
              this.translateService.instant('MESSAGES.ERRORS.LOAD');
            this.notificationService.showError(errorMessage);
            return of(erreurRoles({ messages: errorMessage }));
          })
        )
      )
    )
  );

  parseLoadRole(obs: Observable<RequestResultDto<Array<RoleResponseDto>>>) {
    return obs.pipe(
      map((data: RequestResultDto<Array<RoleResponseDto>>) => {
        if (data.status === 'SUCCESS') {
          return loadRole({ roles: data.data || [] });
        } else {
          return erreurRoles({ messages: data.message || '' });
        }
      }),
      catchError(() =>
        of(erreurRoles({ messages: this.translateService.instant('MESSAGES.ERRORS.LOAD') }))
      )
    );
  }

  parseAddRole(obs: Observable<RequestResultDto<RoleResponseDto>>) {
    return obs.pipe(
      map((data: RequestResultDto<RoleResponseDto>) => {
        if (data.status === 'SUCCESS') {
          return addRole({ role: data.data || {} });
        } else {
          return erreurRoles({ messages: data.message || '' });
        }
      }),
      catchError(() =>
        of(erreurRoles({ messages: this.translateService.instant('MESSAGES.ERRORS.LOAD') }))
      )
    );
  }

  parseLoadRoleItem(obs: Observable<RequestResultDto<Array<AutorisationResponseDto>>>) {
    return obs.pipe(
      map((data: RequestResultDto<Array<AutorisationResponseDto>>) => {
        if (data.status === 'SUCCESS') {
          return loadRoleItem({ roleItems: data.data || [] });
        } else {
          return erreurRoles({ messages: data.message || '' });
        }
      }),
      catchError(() =>
        of(erreurRoles({ messages: this.translateService.instant('MESSAGES.ERRORS.LOAD') }))
      )
    );
  }
}
