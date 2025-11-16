import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import {
  connexion,
  connexionOk,
  erreursAuthentification,
  activateAccountOk,
  activateAccountPlayer,
  resetPasswordAction,
  resetPasswordActionOk,
  validateActivationToken,
  validateActivationTokenOk,
  activateAccountWithToken,
  activateAccountWithTokenOk,
  createSuperAdmin,
  createSuperAdminOk,
  createAdmin,
  createAdminOk,
  createWorkspaceWithAdmin,
  createWorkspaceWithAdminOk,
  createEmployee,
  createEmployeeOk,
  logout,
  logoutOk
} from './authentification.actions';
import { TranslateService } from '@ngx-translate/core';
import { AuthentificationService } from '../../services/authentification.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { NotificationService } from '../../services/notification.service';
import { RequestResultDto } from '../../dtos/request-result-dto.modal';
import { User } from '../../models/users/user.modal';
import { Store } from '@ngrx/store';
import { setUserProfile } from '../profile/profile.actions';
import { ValidateTokenResponseDto } from '../../dtos/validate-token-response-dto.modal';
import { isCriticalHttpError } from '../../utils/error-handler.util';

@Injectable()
export class AuthenticationEffects {
  private router = inject(Router);

  constructor(
    private authentificationService: AuthentificationService,
    private actions$: Actions,
    private translateService: TranslateService,
    private localStorageService: LocalStorageService,
    private storeService: Store,
    private notificationService: NotificationService
  ) {}

  connexion = createEffect(() =>
    this.actions$.pipe(
      ofType(connexion),
      mergeMap(({ loginDto }) =>
        this.authentificationService.login(loginDto).pipe(
          map((data: RequestResultDto<any>) => {
            const token = (data.data as any)?.accessToken || (data.data as any)?.token || '';
            const refreshToken = (data.data as any)?.refreshToken || '';
            const user = (data.data as any)?.user || data.data;
            if (data.status == 'SUCCESS' && token) {
              this.localStorageService.setCurrentTokenValueFin(token);
              if (refreshToken) {
                this.localStorageService.setRefreshToken(refreshToken);
              }
              this.localStorageService.setCurrentUser(user || {});
              this.storeService.dispatch(setUserProfile({ user: user }));
              this.notificationService.showSuccess('Connexion réussie!');
              return connexionOk({ typeUser: user });
            } else {
              const errorMsg = data.message || 'Erreur lors de la connexion';
              this.notificationService.showError(errorMsg);
              return erreursAuthentification({ messages: errorMsg });
            }
          }),
          catchError((error) => {
            const errorMsg =
              error?.error?.message ||
              error?.message ||
              this.translateService.instant('MESSAGES.ERRORS.LOAD');
            this.notificationService.showError(errorMsg);
            return of(erreursAuthentification({ messages: errorMsg }));
          })
        )
      )
    )
  );

  activateAccount = createEffect(() =>
    this.actions$.pipe(
      ofType(activateAccountPlayer),
      mergeMap(({ passwordDto }) =>
        this.authentificationService.activateAccount(passwordDto).pipe(
          map((data: RequestResultDto<string>) => {
            if (data.status == 'SUCCESS') {
              return activateAccountOk();
            } else {
              return erreursAuthentification({ messages: data.message || '' });
            }
          }),
          catchError((err) => {
            return of(erreursAuthentification({ messages: err }));
          })
        )
      )
    )
  );

  resetPasswordAction = createEffect(() =>
    this.actions$.pipe(
      ofType(resetPasswordAction),
      mergeMap(({ resetPasswordDto }) =>
        this.authentificationService.resetPassword(resetPasswordDto).pipe(
          map((data: RequestResultDto<string>) => {
            if (data.status == 'SUCCESS') {
              return resetPasswordActionOk({ msg: data.message });
            } else {
              return erreursAuthentification({ messages: data.message || '' });
            }
          }),
          catchError((err) => {
            return of(erreursAuthentification({ messages: err }));
          })
        )
      )
    )
  );

  validateActivationTokenEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(validateActivationToken),
      mergeMap(({ token }) =>
        this.authentificationService.validateActivationToken(token).pipe(
          map((data: RequestResultDto<ValidateTokenResponseDto>) => {
            if (data.status == 'SUCCESS' && data.data?.valid) {
              return validateActivationTokenOk({ tokenData: data.data });
            } else {
              return erreursAuthentification({
                messages: data.message || 'Token invalide ou expiré'
              });
            }
          }),
          catchError((error) => {
            return of(
              erreursAuthentification({
                messages:
                  this.translateService.instant('MESSAGES.ERRORS.LOAD') ||
                  'Erreur lors de la validation du token'
              })
            );
          })
        )
      )
    )
  );

  activateAccountWithTokenEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(activateAccountWithToken),
      mergeMap(({ activateAccountDto }) =>
        this.authentificationService.activateAccountWithToken(activateAccountDto).pipe(
          map((data: RequestResultDto<any>) => {
            if (data.status == 'SUCCESS') {
              return activateAccountWithTokenOk();
            } else {
              return erreursAuthentification({
                messages: data.message || "Erreur lors de l'activation du compte"
              });
            }
          }),
          catchError((error) => {
            return of(
              erreursAuthentification({
                messages:
                  this.translateService.instant('MESSAGES.ERRORS.LOAD') ||
                  "Erreur lors de l'activation du compte"
              })
            );
          })
        )
      )
    )
  );

  createSuperAdminEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(createSuperAdmin),
      mergeMap(({ createSuperAdminDto }) =>
        this.authentificationService.createSuperAdmin(createSuperAdminDto).pipe(
          map((data: RequestResultDto<User>) => {
            if (data.status == 'SUCCESS') {
              this.notificationService.showSuccess(
                "SuperAdmin créé avec succès! Un email d'invitation a été envoyé."
              );
              return createSuperAdminOk({ user: data.data });
            } else {
              const errorMsg = data.message || 'Erreur lors de la création du SuperAdmin';
              this.notificationService.showError(errorMsg);
              return erreursAuthentification({ messages: errorMsg });
            }
          }),
          catchError((error) => {
            if (isCriticalHttpError(error)) {
              throw error;
            }
            const errorMsg =
              this.translateService.instant('MESSAGES.ERRORS.LOAD') ||
              'Erreur lors de la création du SuperAdmin';
            this.notificationService.showError(errorMsg);
            return of(erreursAuthentification({ messages: errorMsg }));
          })
        )
      )
    )
  );

  createAdminEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(createAdmin),
      mergeMap(({ createAdminDto }) =>
        this.authentificationService.createAdmin(createAdminDto).pipe(
          map((data: RequestResultDto<User>) => {
            if (data.status == 'SUCCESS') {
              this.notificationService.showSuccess(
                "Admin créé avec succès! Un email d'invitation a été envoyé."
              );
              return createAdminOk({ user: data.data });
            } else {
              const errorMsg = data.message || "Erreur lors de la création de l'Admin";
              this.notificationService.showError(errorMsg);
              return erreursAuthentification({ messages: errorMsg });
            }
          }),
          catchError((error) => {
            if (isCriticalHttpError(error)) {
              throw error;
            }
            const errorMsg =
              this.translateService.instant('MESSAGES.ERRORS.LOAD') ||
              "Erreur lors de la création de l'Admin";
            this.notificationService.showError(errorMsg);
            return of(erreursAuthentification({ messages: errorMsg }));
          })
        )
      )
    )
  );

  createWorkspaceWithAdminEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(createWorkspaceWithAdmin),
      mergeMap(({ createWorkspaceWithAdminDto }) =>
        this.authentificationService.createWorkspaceWithAdmin(createWorkspaceWithAdminDto).pipe(
          map((data: RequestResultDto<any>) => {
            if (data.status == 'SUCCESS') {
              this.notificationService.showSuccess(
                "Workspace et Admin créés avec succès! Un email d'invitation a été envoyé."
              );
              return createWorkspaceWithAdminOk({ data: data.data });
            } else {
              const errorMsg =
                data.message || "Erreur lors de la création du Workspace et de l'Admin";
              this.notificationService.showError(errorMsg);
              return erreursAuthentification({ messages: errorMsg });
            }
          }),
          catchError((error) => {
            if (isCriticalHttpError(error)) {
              throw error;
            }
            const errorMsg =
              this.translateService.instant('MESSAGES.ERRORS.LOAD') ||
              "Erreur lors de la création du Workspace et de l'Admin";
            this.notificationService.showError(errorMsg);
            return of(erreursAuthentification({ messages: errorMsg }));
          })
        )
      )
    )
  );

  createEmployeeEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(createEmployee),
      mergeMap(({ createEmployeeDto }) =>
        this.authentificationService.createEmployee(createEmployeeDto).pipe(
          map((data: RequestResultDto<User>) => {
            if (data.status == 'SUCCESS') {
              this.notificationService.showSuccess(
                "Employé créé avec succès! Un email d'invitation a été envoyé."
              );
              return createEmployeeOk({ user: data.data });
            } else {
              const errorMsg = data.message || "Erreur lors de la création de l'Employé";
              this.notificationService.showError(errorMsg);
              return erreursAuthentification({ messages: errorMsg });
            }
          }),
          catchError((error) => {
            if (isCriticalHttpError(error)) {
              throw error;
            }
            const errorMsg =
              this.translateService.instant('MESSAGES.ERRORS.LOAD') ||
              "Erreur lors de la création de l'Employé";
            this.notificationService.showError(errorMsg);
            return of(erreursAuthentification({ messages: errorMsg }));
          })
        )
      )
    )
  );

  logoutEffect = createEffect(
    () =>
      this.actions$.pipe(
        ofType(logout),
        mergeMap(() => {
          const refreshToken = this.localStorageService.getRefreshToken();
          if (!refreshToken) {
            this.localStorageService.logout();
            this.storeService.dispatch(setUserProfile({ user: null }));
            setTimeout(() => {
              this.router.navigate(['/']).then(() => {
                window.location.reload();
              });
            }, 100);
            return of(logoutOk());
          }

          return this.authentificationService.logout({ refreshToken }).pipe(
            map((data: RequestResultDto<any>) => {
              this.localStorageService.logout();
              this.storeService.dispatch(setUserProfile({ user: null }));
              setTimeout(() => {
                this.router.navigate(['/']).then(() => {
                  window.location.reload();
                });
              }, 100);
              return logoutOk();
            }),
            catchError((error) => {
              this.localStorageService.logout();
              this.storeService.dispatch(setUserProfile({ user: null }));
              setTimeout(() => {
                this.router.navigate(['/']).then(() => {
                  window.location.reload();
                });
              }, 100);
              return of(logoutOk());
            })
          );
        })
      ),
    { dispatch: true }
  );
}
