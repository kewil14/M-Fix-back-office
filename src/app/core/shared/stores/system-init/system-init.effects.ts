import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, mergeMap, of } from "rxjs";

import { activateInit, checkStateAction, erreursSystemInit, initialise, setState } from "./system-init.actions";
import { TranslateService } from "@ngx-translate/core";
import { RequestResultDto } from "../../dtos/request-result-dto.modal";
import { SystemInitService } from "../../services/system-init.service";

@Injectable()
export class SystemInitEffects {
    
    activateInit = createEffect(() => this.actions$
        .pipe(
            ofType(activateInit),
            mergeMap(({init}) => this.systemInitService.initialize(init).pipe(
                map(
                    (data: RequestResultDto<boolean>) => {
                        if(data.status == 'SUCCESS') {
                            // console.log(data);
                            // this.localStorageService.setCurrentTokenValue(data);
                            return initialise({res: data.data })
                        } else {
                            return erreursSystemInit({messages: data.message || ''})
                        }
                        
                    }
                ),
                catchError((err) => { return of(erreursSystemInit({messages: err}))})
                
            ))
        )
    )

    checkStateAction = createEffect(() => this.actions$
        .pipe(
            ofType(checkStateAction),
            mergeMap(({}) => this.systemInitService.checkInit().pipe(
                map(
                    (data: RequestResultDto<boolean>) => {
                        if(data.status == 'SUCCESS') {
                            return setState({res:data.data});
                        } else {
                            return erreursSystemInit({messages: data.message || ''})
                        }
                    }
                ),
                catchError((err) => { return of(erreursSystemInit({messages: err}))})
            ))
        )
    )

    constructor(
        private actions$: Actions,
        private translateService: TranslateService,
        private systemInitService: SystemInitService
    ) {}
}