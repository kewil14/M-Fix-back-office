import { TranslateService } from '@ngx-translate/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { erreurProfiles, setUserProfile, checkProfile,
  userLogin, 
} from './profile.actions';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import { RequestResultDto } from '../../dtos/request-result-dto.modal';


@Injectable()
export class ProfileEffects {


  

  // findUserByToken = createEffect(() => this.actions$.pipe(
  //   ofType(checkProfile),
  //   mergeMap(({userCode}) => this.parseSetLoginUser(this.playerService.findConnectedPlayer(userCode)))
  // ));


  constructor(private actions$: Actions,
    private translateService: TranslateService,
    // private playerService: PlayerService
  )
  {}

  // parseSetUser(obs: Observable<RequestResultDto<PlayerResponseDto>>) {
  //   return obs.pipe(
  //     map(
  //       (data: RequestResultDto<PlayerResponseDto>) => {
  //         if(data.status === 'SUCCESS'){
  //           return setUserProfile({player: data.data || {}})
  //         } else {
  //           return erreurProfiles({messages: data.message || ''})
  //         }
  //       }
  //     ), catchError(() => of(erreurProfiles({messages: this.translateService.instant('MESSAGES.ERRORS.LOAD')})))
  //   )
  // }

  // parseSetLoginUser(obs: Observable<RequestResultDto<PlayerResponseDto>>) {
  //   return obs.pipe(
  //     map(
  //       (data: RequestResultDto<PlayerResponseDto>) => {
  //         if(data.status === 'SUCCESS'){
  //           userLogin({isLogin: true})
  //           return setUserProfile({player: data.data || {}})
  //         } else {
  //           userLogin({isLogin: false})
  //           return erreurProfiles({messages: data.message || ''})
  //         }
  //       }
  //     ), catchError(() => of(erreurProfiles({messages: this.translateService.instant('MESSAGES.ERRORS.LOAD')})))
  //   )
  // }
}
