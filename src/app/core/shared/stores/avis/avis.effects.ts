import { TranslateService } from '@ngx-translate/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';

import { catchError, map, mergeMap } from 'rxjs/operators';

import {Observable, of} from 'rxjs';
import { RequestResultDto } from '../../dtos/request-result-dto.modal';
import { addAvis, createAvis, deleteAvis, erreurAvis, findAllAvis, findAllAvisByState, loadAvis, removeAvis, setAvis, updateStatusAvis } from './avis.actions';
import { AvisService } from '../../services/avis.service';
import { Avis } from '../../models/avis.modal';

@Injectable()
export class AvisEffects {

  findAllAvis$ = createEffect(() => this.actions$.pipe(
    ofType(findAllAvis),
    mergeMap(() => this.parseLoadAllAviss(this.avisService.getAllAvis()))
  ));
  
  
  findAllAvisByState$ = createEffect(() => this.actions$.pipe(
    ofType(findAllAvisByState),
    mergeMap(({state}) => this.parseLoadAllAviss(this.avisService.getAllAvisByState(state)))
  ));

  deleteAvis$ = createEffect(() => this.actions$.pipe(
    ofType(deleteAvis),
    mergeMap(({id}) => this.parseDeleteAvis(this.avisService.deleteAvis(id)))
  ));

  updateStatusAvis$ = createEffect(() => this.actions$.pipe(
    ofType(updateStatusAvis),
    mergeMap(({avis, status}) => this.parseUpdateAvis(this.avisService.updateStatusAvis(avis, status)))
  ));

  createAvis$ = createEffect(() => this.actions$.pipe(
    ofType(createAvis),
    mergeMap(({avis}) => this.parseSetAvis(this.avisService.createAvis(avis)))
  ))
  

  constructor(
    private actions$: Actions,
    private translateService: TranslateService,
    private avisService: AvisService,
  )
  {}

  
  parseLoadAllAviss(obs: Observable<RequestResultDto<Avis[]>>) {
    return obs.pipe(
      map(
        (data: RequestResultDto<Avis[]>) => {
          if(data.status === 'SUCCESS'){
            return loadAvis({avis: data.data || []})
          } else {
            return erreurAvis({messages: data.message || ''})
          }
        }
      ), catchError(() => of(erreurAvis({messages: this.translateService.instant('MESSAGES.ERRORS.LOAD')})))
    )
  }

  parseDeleteAvis(obs: Observable<RequestResultDto<string>>) {
    return obs.pipe(
      map(
        (data: RequestResultDto<string>) => {
          if(data.status === 'SUCCESS'){
            return removeAvis({message: data.data || ''})
          } else {
            return erreurAvis({messages: data.message || ''})
          }
        }
      ), catchError(() => of(erreurAvis({messages: this.translateService.instant('MESSAGES.ERRORS.LOAD')})))
    )
  }

  parseUpdateAvis(obs: Observable<RequestResultDto<Avis>>) {
    return obs.pipe(
      map(
        (data: RequestResultDto<Avis>) => {
          if(data.status === 'SUCCESS'){
            return setAvis({avis: data.data || {}})
          } else {
            return erreurAvis({messages: data.message || ''})
          }
        }
      ), catchError(() => of(erreurAvis({messages: this.translateService.instant('MESSAGES.ERRORS.LOAD')})))
    )
  }


  parseSetAvis(obs: Observable<RequestResultDto<Avis>>) {
    return obs.pipe(
      map(
        (data: RequestResultDto<Avis>) => {
          if(data.status === 'SUCCESS'){
            return addAvis({avis: data.data || {}})
          } else {
            return erreurAvis({messages: data.message || ''})
          }
        }
      ), catchError(() => of(erreurAvis({messages: this.translateService.instant('MESSAGES.ERRORS.LOAD')})))
    )
  }

}
