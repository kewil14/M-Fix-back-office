import { TranslateService } from '@ngx-translate/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';

import { catchError, map, mergeMap } from 'rxjs/operators';

import {Observable, of} from 'rxjs';
import { RequestResultDto } from '../../dtos/request-result-dto.modal';
import { RequestResultPaginateDto } from '../../dtos/request-result-paginate-dto.modal';
import { erreurDevis, findAllDevis, loadDevis, setDevis, updateDevis } from './devis.actions';
import { DevisService } from '../../services/devis.service';
import { Devis } from '../../models/devis.modal';

@Injectable()
export class DevisEffects {

  findAllDevis$ = createEffect(() => this.actions$.pipe(
    ofType(findAllDevis),
    mergeMap(({userCode ,state, startDate, endDate, page, size, sort}) => this.parseLoadAllDevis(this.devisService.getAllDevis(userCode ,state, startDate, endDate, page, size, sort)))
  ));  

 

  // deleteDevi$ = createEffect(() => this.actions$.pipe(
  //   ofType(deleteDevis),
  //   mergeMap(({userCode}) => this.parseDeleteDevi(this.userService.deleteCustomer(userCode)))
  // ));

  updateDevi$ = createEffect(() => this.actions$.pipe(
    ofType(updateDevis),
    mergeMap(({devis}) => this.parseUpdateDevi(this.devisService.updateDevis(devis)))
  ));
  

  constructor(
    private actions$: Actions,
    private translateService: TranslateService,
    private devisService: DevisService,
  )
  {}

  
  parseLoadAllDevis(obs: Observable<RequestResultDto<RequestResultPaginateDto<Devis[]>>>) {
    return obs.pipe(
      map(
        (data: RequestResultDto<RequestResultPaginateDto<Devis[]>>) => {
          if(data.status === 'SUCCESS'){
            return loadDevis({devis: data.data.content || []})
          } else {
            return erreurDevis({messages: data.message || ''})
          }
        }
      ), catchError(() => of(erreurDevis({messages: this.translateService.instant('MESSAGES.ERRORS.LOAD')})))
    )
  }


  // parseConnectedDevi(obs: Observable<RequestResultDto<Devis>>) {
  //   return obs.pipe(
  //     map(
  //       (data: RequestResultDto<Devis>) => {
  //         if(data.status === 'SUCCESS'){
  //           return loadDevi({user: data.data || {}})
  //         } else {
  //           return erreurDevis({messages: data.message || ''})
  //         }
  //       }
  //     ), catchError(() => of(erreurDevis({messages: this.translateService.instant('MESSAGES.ERRORS.LOAD')})))
  //   )
  // }

  // parseDeleteDevi(obs: Observable<RequestResultDto<string>>) {
  //   return obs.pipe(
  //     map(
  //       (data: RequestResultDto<string>) => {
  //         if(data.status === 'SUCCESS'){
  //           return removeDevi({message: data.data || ''})
  //         } else {
  //           return erreurDevis({messages: data.message || ''})
  //         }
  //       }
  //     ), catchError(() => of(erreurDevis({messages: this.translateService.instant('MESSAGES.ERRORS.LOAD')})))
  //   )
  // }

  parseUpdateDevi(obs: Observable<RequestResultDto<Devis>>) {
    return obs.pipe(
      map(
        (data: RequestResultDto<Devis>) => {
          if(data.status === 'SUCCESS'){
            return setDevis({devi: data.data || {}})
          } else {
            return erreurDevis({messages: data.message || ''})
          }
        }
      ), catchError(() => of(erreurDevis({messages: this.translateService.instant('MESSAGES.ERRORS.LOAD')})))
    )
  }

}
