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
  logoutOk,
  resendInvitation,
  resendInvitationOk,
  resendInvitationError,
  getInvitations,
  getInvitationsOk,
  getInvitationsError,
  getInvitationById,
  getInvitationByIdOk,
  getInvitationByIdError,
  sendTokenResetPassword,
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
            // Vérifier si le status est SUCCESS et que le token est valide
            if (data.status === 'SUCCESS' && data.data?.valid === true) {
              // Afficher un message de succès si le backend en fournit un
              if (data.message) {
                this.notificationService.showSuccess(data.message);
              }
              return validateActivationTokenOk({ tokenData: data.data });
            } else {
              // Le backend a retourné SUCCESS mais le token est invalide (valid === false)
              // ou le status est ERROR
              const errorMessage = data.message || 'Token invalide ou expiré';
              this.notificationService.showError(errorMessage);
              
              // Rediriger vers la page de login si le token est invalide
              if (data.status === 'SUCCESS' && data.data?.valid === false) {
                setTimeout(() => {
                  this.router.navigate(['/'], { replaceUrl: true });
                }, 2000);
              }
              
              return erreursAuthentification({
                messages: errorMessage
              });
            }
          }),
          catchError((error) => {
            // Extraire le message d'erreur du backend si disponible
            // Le backend peut retourner le message dans error.error.message (structure standard)
            const errorMessage = error?.error?.message || 
                                error?.message || 
                                this.translateService.instant('MESSAGES.ERRORS.LOAD') ||
                                'Erreur lors de la validation du token';
            // Toujours afficher le message d'erreur à l'utilisateur
            this.notificationService.showError(errorMessage);
            
            // Rediriger vers la page de login en cas d'erreur
            setTimeout(() => {
              this.router.navigate(['/'], { replaceUrl: true });
            }, 2000);
            
            return of(
              erreursAuthentification({
                messages: errorMessage
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
            // Vérifier si le status est SUCCESS
            if (data.status === 'SUCCESS') {
              // Afficher le message de succès du backend
              const successMessage = data.message || 
                                    (data.data?.message) || 
                                    "Votre compte a été activé avec succès";
              this.notificationService.showSuccess(successMessage);
              return activateAccountWithTokenOk();
            } else {
              // Le backend a retourné une erreur (status ERROR)
              // Toujours afficher le message du backend
              const errorMessage = data.message || "Erreur lors de l'activation du compte";
              this.notificationService.showError(errorMessage);
              return erreursAuthentification({
                messages: errorMessage
              });
            }
          }),
          catchError((error) => {
            // Extraire le message d'erreur du backend si disponible
            // Le backend peut retourner le message dans error.error.message (structure standard)
            const errorMessage = error?.error?.message || 
                                error?.message || 
                                this.translateService.instant('MESSAGES.ERRORS.LOAD') ||
                                "Erreur lors de l'activation du compte";
            // Toujours afficher le message d'erreur à l'utilisateur
            this.notificationService.showError(errorMessage);
            return of(
              erreursAuthentification({
                messages: errorMessage
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

  resendInvitationEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(resendInvitation),
      mergeMap(({ resendInvitationDto }) =>
        this.authentificationService.resendInvitation(resendInvitationDto).pipe(
          map((data: RequestResultDto<string>) => {
            if (data.status === 'SUCCESS') {
              this.notificationService.showSuccess(
                data.message || "L'invitation a été renvoyée avec succès"
              );
              return resendInvitationOk({ message: data.message || data.data || "Invitation renvoyée" });
            } else {
              const errorMsg = data.message || "Erreur lors du renvoi de l'invitation";
              this.notificationService.showError(errorMsg);
              return resendInvitationError({ messages: errorMsg });
            }
          }),
          catchError((error) => {
            if (isCriticalHttpError(error)) {
              throw error;
            }
            const errorMessage =
              error?.error?.message ||
              error?.message ||
              this.translateService.instant('MESSAGES.ERRORS.LOAD') ||
              "Erreur lors du renvoi de l'invitation";
            this.notificationService.showError(errorMessage);
            return of(resendInvitationError({ messages: errorMessage }));
          })
        )
      )
    )
  );

  // Forgot password : envoi de l'email de réinitialisation
  forgotPasswordEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(sendTokenResetPassword),
      mergeMap(({ emailDto }) =>
        this.authentificationService.forgotPassword(emailDto).pipe(
          map((data: RequestResultDto<string>) => {
            if (data.status === 'SUCCESS') {
              const successMsg =
                data.message ||
                (data.data as any)?.message ||
                "Un email de réinitialisation vous a été envoyé.";
              this.notificationService.showSuccess(successMsg);
              return resetPasswordActionOk({ msg: successMsg });
            } else {
              const errorMsg = data.message || "Erreur lors de la demande de réinitialisation du mot de passe";
              this.notificationService.showError(errorMsg);
              return erreursAuthentification({ messages: errorMsg });
            }
          }),
          catchError((error) => {
            if (isCriticalHttpError(error)) {
              throw error;
            }
            const errorMessage =
              error?.error?.message ||
              error?.message ||
              this.translateService.instant('MESSAGES.ERRORS.LOAD') ||
              "Erreur lors de la demande de réinitialisation du mot de passe";
            this.notificationService.showError(errorMessage);
            return of(erreursAuthentification({ messages: errorMessage }));
          })
        )
      )
    )
  );

  getInvitationsEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(getInvitations),
      mergeMap(({ invitationListRequestDto }) =>
        this.authentificationService.getInvitations(invitationListRequestDto).pipe(
          map((data: RequestResultDto<any>) => {
            if (data.status === 'SUCCESS' && data.data) {
              return getInvitationsOk({ invitations: data.data });
            } else {
              // Le backend a retourné une erreur (status ERROR)
              const errorMsg = data.message || "Erreur lors de la récupération des invitations";
              this.notificationService.showError(errorMsg);
              return getInvitationsError({ messages: errorMsg });
            }
          }),
          catchError((error) => {
            if (isCriticalHttpError(error)) {
              throw error;
            }
            const errorMessage =
              error?.error?.message ||
              error?.message ||
              this.translateService.instant('MESSAGES.ERRORS.LOAD') ||
              "Erreur lors de la récupération des invitations";
            this.notificationService.showError(errorMessage);
            return of(getInvitationsError({ messages: errorMessage }));
          })
        )
      )
    )
  );

  getInvitationByIdEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(getInvitationById),
      mergeMap(({ invitationId }) =>
        this.authentificationService.getInvitationById(invitationId).pipe(
          map((data: RequestResultDto<any>) => {
            if (data.status === 'SUCCESS' && data.data) {
              return getInvitationByIdOk({ invitation: data.data });
            } else {
              // Le backend a retourné une erreur (status ERROR)
              const errorMsg = data.message || "Erreur lors de la récupération de l'invitation";
              this.notificationService.showError(errorMsg);
              return getInvitationByIdError({ messages: errorMsg });
            }
          }),
          catchError((error) => {
            if (isCriticalHttpError(error)) {
              throw error;
            }
            const errorMessage =
              error?.error?.message ||
              error?.message ||
              this.translateService.instant('MESSAGES.ERRORS.LOAD') ||
              "Erreur lors de la récupération de l'invitation";
            this.notificationService.showError(errorMessage);
            return of(getInvitationByIdError({ messages: errorMessage }));
          })
        )
      )
    )
  );
}
