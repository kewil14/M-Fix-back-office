import { TranslateService } from '@ngx-translate/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';

import { catchError, map, mergeMap } from 'rxjs/operators';

import {Observable, of} from 'rxjs';
import { RequestResultDto } from '../../dtos/request-result-dto.modal';
import { RequestResultPaginateDto } from '../../dtos/request-result-paginate-dto.modal';
import { DevisService } from '../../services/devis.service';
import { Devis } from '../../models/devis.modal';
import { DemandeService } from '../../services/demande.service';
import { addDemande, createDemande, erreurDemandes, findAllDemandes, loadDemandes, setDemande, updateDemande } from './demande.actions';

@Injectable()
export class DemandeEffects {

  findAllDemandes$ = createEffect(() => this.actions$.pipe(
    ofType(findAllDemandes),
    mergeMap(({state, page, size, sort}) => this.parseLoadAllDevis(this.demandeService.getAllDemand(state, page, size, sort)))
  ));  

 

  // deleteDevi$ = createEffect(() => this.actions$.pipe(
  //   ofType(deleteDevis),
  //   mergeMap(({userCode}) => this.parseDeleteDevi(this.userService.deleteCustomer(userCode)))
  // ));

  createDemande$ = createEffect(() => this.actions$.pipe(
    ofType(createDemande),
    mergeMap(({demande}) => this.parseCreateDevi(this.demandeService.createDemand(demande)))
  ));

  updateDemande$ = createEffect(() => this.actions$.pipe(
    ofType(updateDemande),
    mergeMap(({demande}) => this.parseUpdateDevi(this.demandeService.updateStatusDemand(demande)))
  ));
  

  constructor(
    private actions$: Actions,
    private translateService: TranslateService,
    private demandeService: DemandeService,
  )
  {}

  
  parseLoadAllDevis(obs: Observable<RequestResultDto<RequestResultPaginateDto<Devis[]>>>) {
    return obs.pipe(
      map(
        (data: RequestResultDto<RequestResultPaginateDto<Devis[]>>) => {
          if(data.status === 'SUCCESS'){
            return loadDemandes({demandes: data.data.content || []})
          } else {
            return erreurDemandes({messages: data.message || ''})
          }
        }
      ), catchError(() => of(erreurDemandes({messages: this.translateService.instant('MESSAGES.ERRORS.LOAD')})))
    )
  }


  // parseConnectedDevi(obs: Observable<RequestResultDto<Devis>>) {
  //   return obs.pipe(
  //     map(
  //       (data: RequestResultDto<Devis>) => {
  //         if(data.status === 'SUCCESS'){
  //           return loadDevi({user: data.data || {}})
  //         } else {
  //           return erreurDemandes({messages: data.message || ''})
  //         }
  //       }
  //     ), catchError(() => of(erreurDemandes({messages: this.translateService.instant('MESSAGES.ERRORS.LOAD')})))
  //   )
  // }

  // parseDeleteDevi(obs: Observable<RequestResultDto<string>>) {
  //   return obs.pipe(
  //     map(
  //       (data: RequestResultDto<string>) => {
  //         if(data.status === 'SUCCESS'){
  //           return removeDevi({message: data.data || ''})
  //         } else {
  //           return erreurDemandes({messages: data.message || ''})
  //         }
  //       }
  //     ), catchError(() => of(erreurDemandes({messages: this.translateService.instant('MESSAGES.ERRORS.LOAD')})))
  //   )
  // }

  parseUpdateDevi(obs: Observable<RequestResultDto<Devis>>) {
    return obs.pipe(
      map(
        (data: RequestResultDto<Devis>) => {
          if(data.status === 'SUCCESS'){
            return setDemande({demande: data.data || {}})
          } else {
            return erreurDemandes({messages: data.message || ''})
          }
        }
      ), catchError(() => of(erreurDemandes({messages: this.translateService.instant('MESSAGES.ERRORS.LOAD')})))
    )
  }


  parseCreateDevi(obs: Observable<RequestResultDto<Devis>>) {
    return obs.pipe(
      map(
        (data: RequestResultDto<Devis>) => {
          if(data.status === 'SUCCESS'){
            return addDemande({demande: data.data || {}})
          } else {
            return erreurDemandes({messages: data.message || ''})
          }
        }
      ), catchError(() => of(erreurDemandes({messages: this.translateService.instant('MESSAGES.ERRORS.LOAD')})))
    )
  }

}
