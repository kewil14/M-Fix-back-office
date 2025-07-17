import { TranslateService } from '@ngx-translate/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';

import { catchError, map, mergeMap } from 'rxjs/operators';

import {Observable, of} from 'rxjs';
import { RequestResultDto } from '../../dtos/request-result-dto.modal';
import { addUser, createUser, deleteUser, erreurUsers, findAllUsers, findConnectedUser, loadUser, loadUsers, removeUser, setUser, updateUser } from './user.actions';
import { UserService } from '../../services/user.service';
import { UserResponseDto } from '../../dtos/user-response-dto.modal';
import { RequestResultPaginateDto } from '../../dtos/request-result-paginate-dto.modal';
import { LocalStorageService } from '../../services/local-storage.service';
import { Store } from '@ngrx/store';
import { setUserProfile } from '../profile/profile.actions';

@Injectable()
export class UserEffects {

  findAllUsers$ = createEffect(() => this.actions$.pipe(
    ofType(findAllUsers),
    mergeMap(({state, userType, page, size, sort}) => this.parseLoadAllUsers(this.userService.getAllCustomer(state, userType, page, size, sort)))
  ));  //updateUser

  findConnectedUser$ = createEffect(() => this.actions$.pipe(
    ofType(findConnectedUser),
    mergeMap(() => this.parseConnectedUser(this.userService.connectedUser()))
  ));

  deleteUser$ = createEffect(() => this.actions$.pipe(
    ofType(deleteUser),
    mergeMap(({userCode}) => this.parseDeleteUser(this.userService.deleteCustomer(userCode)))
  ));

  updateUser$ = createEffect(() => this.actions$.pipe(
    ofType(updateUser),
    mergeMap(({user}) => this.parseUpdateUser(this.userService.updateCustomer(user)))
  ));


  createUser$ = createEffect(() => this.actions$.pipe(
    ofType(createUser),
    mergeMap(({user}) => this.parseAddUser(this.userService.createCustomer(user)))
  ));
  

  constructor(
    private actions$: Actions,
    private translateService: TranslateService,
    private userService: UserService,
    private localStorageService: LocalStorageService,
    private storeService: Store,
    
  )
  {}

  
  parseLoadAllUsers(obs: Observable<RequestResultDto<RequestResultPaginateDto<UserResponseDto[]>>>) {
    return obs.pipe(
      map(
        (data: RequestResultDto<RequestResultPaginateDto<UserResponseDto[]>>) => {
          if(data.status === 'SUCCESS'){
            return loadUsers({users: data.data.content || []})
          } else {
            return erreurUsers({messages: data.message || ''})
          }
        }
      ), catchError(() => of(erreurUsers({messages: this.translateService.instant('MESSAGES.ERRORS.LOAD')})))
    )
  }


  parseConnectedUser(obs: Observable<RequestResultDto<UserResponseDto>>) {
    return obs.pipe(
      map(
        (data: RequestResultDto<UserResponseDto>) => {
          if(data.status === 'SUCCESS'){
            return loadUser({user: data.data || {}})
          } else {
            return erreurUsers({messages: data.message || ''})
          }
        }
      ), catchError(() => of(erreurUsers({messages: this.translateService.instant('MESSAGES.ERRORS.LOAD')})))
    )
  }

  parseDeleteUser(obs: Observable<RequestResultDto<UserResponseDto>>) {
    return obs.pipe(
      map(
        (data: RequestResultDto<UserResponseDto>) => {
          if(data.status === 'SUCCESS'){
            return removeUser({user: data.data || {}})
          } else {
            return erreurUsers({messages: data.message || ''})
          }
        }
      ), catchError(() => of(erreurUsers({messages: this.translateService.instant('MESSAGES.ERRORS.LOAD')})))
    )
  }

  parseUpdateUser(obs: Observable<RequestResultDto<UserResponseDto>>) {
    return obs.pipe(
      map(
        (data: RequestResultDto<UserResponseDto>) => {
          if(data.status === 'SUCCESS'){
            return setUser({user: data.data || {}})
          } else {
            return erreurUsers({messages: data.message || ''})
          }
        }
      ), catchError(() => of(erreurUsers({messages: this.translateService.instant('MESSAGES.ERRORS.LOAD')})))
    )
  }


  parseAddUser(obs: Observable<RequestResultDto<UserResponseDto>>) {
    return obs.pipe(
      map(
        (data: RequestResultDto<UserResponseDto>) => {
          if(data.status === 'SUCCESS'){
            // let token  = data.data?.token || '';
            // this.localStorageService.setCurrentTokenValueFin(token);
            this.localStorageService.setCurrentUser(data.data || {});
            this.storeService.dispatch(setUserProfile({user: data.data}));
            return addUser({user: data.data || {}})
          } else {
            return erreurUsers({messages: data.message || ''})
          }
        }
      ), catchError(() => of(erreurUsers({messages: this.translateService.instant('MESSAGES.ERRORS.LOAD')})))
    )
  }

}
