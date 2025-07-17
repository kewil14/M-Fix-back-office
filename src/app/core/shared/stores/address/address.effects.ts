import { TranslateService } from '@ngx-translate/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';

import { catchError, map, mergeMap } from 'rxjs/operators';

import {Observable, of} from 'rxjs';
import { RequestResultDto } from '../../dtos/request-result-dto.modal';
import { AddressService } from '../../services/address.service';
import { erreurAdress, findAllAdress, loadAdress } from './address.actions';
import { AddressNominatimResponseDto } from '../../dtos/address-nominatim-response-dto';

@Injectable()
export class AdressEffects {

  findAllAdress$ = createEffect(() => this.actions$.pipe(
    ofType(findAllAdress),
    mergeMap(({q}) => this.parseLoadAllAdresss(this.addressService.getAllAddress(q)))
  ));
  

  constructor(
    private actions$: Actions,
    private translateService: TranslateService,
    private addressService: AddressService,
  )
  {}

  
  parseLoadAllAdresss(obs: Observable<AddressNominatimResponseDto[]>) {
    return obs.pipe(
      map(
        (data: AddressNominatimResponseDto[]) => {
          if(data){
            return loadAdress({adress: data || []})
          } 
          // else {
          //   return erreurAdress({messages: data.message || ''})
          // }
        }
      ), catchError(() => of(erreurAdress({messages: this.translateService.instant('MESSAGES.ERRORS.LOAD')})))
    )
  }

  
}
