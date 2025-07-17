import { TranslateService } from '@ngx-translate/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';

import { catchError, map, mergeMap } from 'rxjs/operators';

import {Observable, of} from 'rxjs';
import { RequestResultDto } from '../../dtos/request-result-dto.modal';
import { addGrilles, createGrilles, deleteGrille, erreurGrilles, findAllGrilles, loadGrilles, removeGrille, setGrilles, updateGrilles } from './grille.actions';
import { GrilleTarifaireService } from '../../services/grille-tarifaire.service';
import { GrilleTarifaire } from '../../models/grille-tarifaire.modal';

@Injectable()
export class GrilleEffects {

  findAllGrilles$ = createEffect(() => this.actions$.pipe(
    ofType(findAllGrilles),
    mergeMap(() => this.parseLoadAllGrilles(this.grilleService.getAllGrille()))
  ));  

  
  deleteGrille$ = createEffect(() => this.actions$.pipe(
    ofType(deleteGrille),
    mergeMap(({grilleCode}) => this.parseDeleteGrille(this.grilleService.deleteGrille(grilleCode)))
  ));

  updateGrilles$ = createEffect(() => this.actions$.pipe(
    ofType(updateGrilles),
    mergeMap(({grille}) => this.parseUpdateGrille(this.grilleService.updateGrille(grille)))
  ));


  createGrilles$ = createEffect(() => this.actions$.pipe(
    ofType(createGrilles),
    mergeMap(({grilles}) => this.parseAddGrille(this.grilleService.createGrille(grilles)))
  ));
  

  constructor(
    private actions$: Actions,
    private translateService: TranslateService,
    private grilleService: GrilleTarifaireService,
  )
  {}

  
  parseLoadAllGrilles(obs: Observable<RequestResultDto<GrilleTarifaire[]>>) {
    return obs.pipe(
      map(
        (data: RequestResultDto<GrilleTarifaire[]>) => {
          if(data.status === 'SUCCESS'){
            return loadGrilles({grilles: data.data || []})
          } else {
            return erreurGrilles({messages: data.message || ''})
          }
        }
      ), catchError(() => of(erreurGrilles({messages: this.translateService.instant('MESSAGES.ERRORS.LOAD')})))
    )
  }


  parseDeleteGrille(obs: Observable<RequestResultDto<string>>) {
    return obs.pipe(
      map(
        (data: RequestResultDto<string>) => {
          if(data.status === 'SUCCESS'){
            return removeGrille({message: data.data || ''})
          } else {
            return erreurGrilles({messages: data.message || ''})
          }
        }
      ), catchError(() => of(erreurGrilles({messages: this.translateService.instant('MESSAGES.ERRORS.LOAD')})))
    )
  }

  parseUpdateGrille(obs: Observable<RequestResultDto<GrilleTarifaire>>) {
    return obs.pipe(
      map(
        (data: RequestResultDto<GrilleTarifaire>) => {
          if(data.status === 'SUCCESS'){
            return setGrilles({grille: data.data || {}})
          } else {
            return erreurGrilles({messages: data.message || ''})
          }
        }
      ), catchError(() => of(erreurGrilles({messages: this.translateService.instant('MESSAGES.ERRORS.LOAD')})))
    )
  }

  parseAddGrille(obs: Observable<RequestResultDto<GrilleTarifaire>>) {
    return obs.pipe(
      map(
        (data: RequestResultDto<GrilleTarifaire>) => {
          if(data.status === 'SUCCESS'){
            return addGrilles({grille: data.data || {}})
          } else {
            return erreurGrilles({messages: data.message || ''})
          }
        }
      ), catchError(() => of(erreurGrilles({messages: this.translateService.instant('MESSAGES.ERRORS.LOAD')})))
    )
  }

}
