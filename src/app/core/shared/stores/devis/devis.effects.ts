import { TranslateService } from '@ngx-translate/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { RequestResultDto } from '../../dtos/request-result-dto.modal';
import { RequestResultPaginateDto } from '../../dtos/request-result-paginate-dto.modal';
import { erreurDevis, findAllDevis, loadDevis, setDevis, updateDevis } from './devis.actions';
import { DevisService } from '../../services/devis.service';
import { NotificationService } from '../../services/notification.service';
import { Devis } from '../../models/devis.modal';

@Injectable()
export class DevisEffects {
  findAllDevis$ = createEffect(() =>
    this.actions$.pipe(
      ofType(findAllDevis),
      mergeMap(({ userCode, state, startDate, endDate, page, size, sort }) =>
        this.parseLoadAllDevis(
          this.devisService.getAllDevis(userCode, state, startDate, endDate, page, size, sort)
        )
      )
    )
  );

  updateDevi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateDevis),
      mergeMap(({ devis }) => this.parseUpdateDevi(this.devisService.updateDevis(devis)))
    )
  );

  constructor(
    private actions$: Actions,
    private translateService: TranslateService,
    private devisService: DevisService,
    private notificationService: NotificationService
  ) {}

  parseLoadAllDevis(obs: Observable<RequestResultDto<RequestResultPaginateDto<Devis[]>>>) {
    return obs.pipe(
      map((data: RequestResultDto<RequestResultPaginateDto<Devis[]>>) => {
        if (data.status === 'SUCCESS') {
          return loadDevis({ devis: data.data.content || [] });
        } else {
          return erreurDevis({ messages: data.message || '' });
        }
      }),
      catchError(() =>
        of(erreurDevis({ messages: this.translateService.instant('MESSAGES.ERRORS.LOAD') }))
      )
    );
  }

  parseUpdateDevi(obs: Observable<RequestResultDto<Devis>>) {
    return obs.pipe(
      map((data: RequestResultDto<Devis>) => {
        if (data.status === 'SUCCESS') {
          this.notificationService.showSuccess('Devis mis à jour avec succès!');
          return setDevis({ devi: data.data || {} });
        } else {
          const errorMsg = data.message || 'Erreur lors de la mise à jour';
          this.notificationService.showError(errorMsg);
          return erreurDevis({ messages: errorMsg });
        }
      }),
      catchError((error) => {
        const errorMessage =
          error?.error?.message ||
          error?.message ||
          this.translateService.instant('MESSAGES.ERRORS.LOAD');
        this.notificationService.showError(errorMessage);
        return of(erreurDevis({ messages: errorMessage }));
      })
    );
  }
}
