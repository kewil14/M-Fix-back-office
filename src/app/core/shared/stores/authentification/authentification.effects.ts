import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, mergeMap, of } from "rxjs";
import { connexion, connexionOk, erreursAuthentification,
    activateAccountOk, activateAccountPlayer,
    resetPasswordAction,
    resetPasswordActionOk
} from "./authentification.actions";
import { TranslateService } from "@ngx-translate/core";
import { AuthentificationService } from "../../services/authentification.service";
import { LocalStorageService } from "../../services/local-storage.service";
import { RequestResultDto } from "../../dtos/request-result-dto.modal";
import { User } from "../../models/users/user.modal";
import { Store } from "@ngrx/store";
import { setUserProfile } from "../profile/profile.actions";

@Injectable()
export class AuthenticationEffects {

    constructor(
        private authentificationService: AuthentificationService,
        private actions$: Actions,
        private translateService: TranslateService,
        private localStorageService: LocalStorageService,
        private storeService: Store,
    ) {}
    
    connexion = createEffect(() => this.actions$
        .pipe(
            ofType(connexion),
            mergeMap(({loginDto}) => this.authentificationService.login(loginDto).pipe(
                map(
                    (data: RequestResultDto<User>) => {
                        let token  = data.data?.token || '';
                        if(data.status == 'SUCCESS') {
                            // console.log(token);
                            this.localStorageService.setCurrentTokenValueFin(token);
                            this.localStorageService.setCurrentUser(data.data || {});
                            this.storeService.dispatch(setUserProfile({user: data.data}));
                            return connexionOk({typeUser: data.data});
                        } else {
                            return erreursAuthentification({messages: data.message || ''})
                        }
                        
                    }
                ),
                catchError(() => { return of(erreursAuthentification({messages: this.translateService.instant('MESSAGES.ERRORS.LOAD')}))})
                
            ))
        )
    )

    activateAccount = createEffect(() => this.actions$
    .pipe(
        ofType(activateAccountPlayer),
        mergeMap(({passwordDto}) => this.authentificationService.activateAccount(passwordDto).pipe(
            map(
                (data: RequestResultDto<string>) => {
                    if(data.status == 'SUCCESS') {
                        return activateAccountOk();
                    } else {
                        return erreursAuthentification({messages: data.message || ''})
                    }
                }
            ),
            catchError((err) => { return of(erreursAuthentification({messages: err}))})
            ))
        )
    )

    // activateAccountPlayer = createEffect(() => this.actions$
    // .pipe(
    //     ofType(activateAccountPlayer),
    //     mergeMap(({passwordDto}) => this.authentificationService.activateAccountPlayer(passwordDto).pipe(
    //         map(
    //             (data: RequestResultDto<string>) => {
    //                 if(data.status == 'SUCCESS') {
    //                     return activateAccountOk();
    //                 } else {
    //                     return erreursAuthentification({messages: data.message || ''})
    //                 }
    //             }
    //         ),
    //         catchError((err) => { return of(erreursAuthentification({messages: err}))})
    //         ))
    //     )
    // )

    resetPasswordAction = createEffect(() => this.actions$
        .pipe(
            ofType(resetPasswordAction),
            mergeMap(({ resetPasswordDto }) => this.authentificationService.resetPassword(resetPasswordDto).pipe(
                map(
                    (data: RequestResultDto<string>) => {
                        if (data.status == 'SUCCESS') {
                            return resetPasswordActionOk({msg: data.message});
                        } else {
                            return erreursAuthentification({ messages: data.message || '' })
                        }
                    }
                ),
                catchError((err) => { return of(erreursAuthentification({ messages: err })) })
            ))
        )
    )

    // sendTokenResetPassword = createEffect(() => this.actions$
    //     .pipe(
    //         ofType(sendTokenResetPassword),
    //         mergeMap(({ emailDto }) => this.authentificationService.sendTokenResetPassword(emailDto).pipe(
    //             map(
    //                 (data: RequestResultDto<string>) => {
    //                     if (data.status == 'SUCCESS') {
    //                         return messageAuthentification({message: data.data || ''});
    //                     } else {
    //                         return erreursAuthentification({ messages: data.message || '' })
    //                     }
    //                 }
    //             ),
    //             catchError((err) => { return of(erreursAuthentification({ messages: err })) })
    //         ))
    //     )
    // )

    
}