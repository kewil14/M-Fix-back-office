import { TranslateService } from '@ngx-translate/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { RequestResultDto } from '../../dtos/request-result-dto.modal';
import {
  addUser,
  createUser,
  deleteUser,
  erreurUsers,
  findAllUsers,
  findConnectedUser,
  loadUser,
  loadUsers,
  removeUser,
  setUser,
  updateUser
} from './user.actions';
import { UserService } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';
import { UserResponseDto } from '../../dtos/user-response-dto.modal';
import { RequestResultPaginateDto } from '../../dtos/request-result-paginate-dto.modal';
import { LocalStorageService } from '../../services/local-storage.service';
import { Store } from '@ngrx/store';
import { setUserProfile } from '../profile/profile.actions';

@Injectable()
export class UserEffects {
  findAllUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(findAllUsers),
      mergeMap(({ state, userType, page, size, sort }) =>
        this.parseLoadAllUsers(this.userService.getAllCustomer(state, userType, page, size, sort))
      )
    )
  );

  findConnectedUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(findConnectedUser),
      mergeMap(() => this.parseConnectedUser(this.userService.connectedUser()))
    )
  );

  deleteUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteUser),
      mergeMap(({ userCode }) =>
        this.parseDeleteUser(this.userService.deleteCustomer(userCode))
      )
    )
  );

  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateUser),
      mergeMap(({ user }) => this.parseUpdateUser(this.userService.updateCustomer(user)))
    )
  );

  createUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createUser),
      mergeMap(({ user }) => this.parseAddUser(this.userService.createCustomer(user)))
    )
  );

  constructor(
    private actions$: Actions,
    private translateService: TranslateService,
    private userService: UserService,
    private localStorageService: LocalStorageService,
    private storeService: Store,
    private notificationService: NotificationService
  ) {}

  parseLoadAllUsers(obs: Observable<RequestResultDto<RequestResultPaginateDto<UserResponseDto[]>>>) {
    return obs.pipe(
      map((data: RequestResultDto<RequestResultPaginateDto<UserResponseDto[]>>) => {
        if (data.status === 'SUCCESS') {
          return loadUsers({ users: data.data.content || [] });
        } else {
          return erreurUsers({ messages: data.message || '' });
        }
      }),
      catchError((error) => {
        let errorMessage = this.translateService.instant('MESSAGES.ERRORS.LOAD');
        if (error.status === 403) {
          errorMessage = this.translateService.instant('MESSAGES.ERRORS.FORBIDDEN_ACCESS'); // Assuming this key exists or will be added
        } else if (error.status === 401) {
          errorMessage = this.translateService.instant('MESSAGES.ERRORS.UNAUTHORIZED_ACCESS'); // Assuming this key exists or will be added
        } else if (error?.error?.message) {
          errorMessage = error.error.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }
        this.notificationService.showError(errorMessage);
        return of(erreurUsers({ messages: errorMessage }));
      })
    );
  }

  parseConnectedUser(obs: Observable<RequestResultDto<UserResponseDto>>) {
    return obs.pipe(
      map((data: RequestResultDto<UserResponseDto>) => {
        if (data.status === 'SUCCESS') {
          return loadUser({ user: data.data || {} });
        } else {
          return erreurUsers({ messages: data.message || '' });
        }
      }),
      catchError(() =>
        of(erreurUsers({ messages: this.translateService.instant('MESSAGES.ERRORS.LOAD') }))
      )
    );
  }

  parseDeleteUser(obs: Observable<RequestResultDto<UserResponseDto>>) {
    return obs.pipe(
      map((data: RequestResultDto<UserResponseDto>) => {
        if (data.status === 'SUCCESS') {
          this.notificationService.showSuccess('Utilisateur supprimé avec succès!');
          return removeUser({ user: data.data || {} });
        } else {
          const errorMsg = data.message || 'Erreur lors de la suppression';
          this.notificationService.showError(errorMsg);
          return erreurUsers({ messages: errorMsg });
        }
      }),
      catchError((error) => {
        const errorMessage =
          error?.error?.message ||
          error?.message ||
          this.translateService.instant('MESSAGES.ERRORS.LOAD');
        this.notificationService.showError(errorMessage);
        return of(erreurUsers({ messages: errorMessage }));
      })
    );
  }

  parseUpdateUser(obs: Observable<RequestResultDto<UserResponseDto>>) {
    return obs.pipe(
      map((data: RequestResultDto<UserResponseDto>) => {
        if (data.status === 'SUCCESS') {
          this.notificationService.showSuccess('Utilisateur mis à jour avec succès!');
          return setUser({ user: data.data || {} });
        } else {
          const errorMsg = data.message || 'Erreur lors de la mise à jour';
          this.notificationService.showError(errorMsg);
          return erreurUsers({ messages: errorMsg });
        }
      }),
      catchError((error) => {
        const errorMessage =
          error?.error?.message ||
          error?.message ||
          this.translateService.instant('MESSAGES.ERRORS.LOAD');
        this.notificationService.showError(errorMessage);
        return of(erreurUsers({ messages: errorMessage }));
      })
    );
  }

  parseAddUser(obs: Observable<RequestResultDto<UserResponseDto>>) {
    return obs.pipe(
      map((data: RequestResultDto<UserResponseDto>) => {
        if (data.status === 'SUCCESS') {
          this.localStorageService.setCurrentUser(data.data || {});
          this.storeService.dispatch(setUserProfile({ user: data.data }));
          this.notificationService.showSuccess('Utilisateur créé avec succès!');
          return addUser({ user: data.data || {} });
        } else {
          const errorMsg = data.message || 'Erreur lors de la création';
          this.notificationService.showError(errorMsg);
          return erreurUsers({ messages: errorMsg });
        }
      }),
      catchError((error) => {
        const errorMessage =
          error?.error?.message ||
          error?.message ||
          this.translateService.instant('MESSAGES.ERRORS.LOAD');
        this.notificationService.showError(errorMessage);
        return of(erreurUsers({ messages: errorMessage }));
      })
    );
  }
}
