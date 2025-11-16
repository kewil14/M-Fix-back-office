import { TranslateService } from '@ngx-translate/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { RequestResultDto } from '../../dtos/request-result-dto.modal';
import { RequestResultPaginateDto } from '../../dtos/request-result-paginate-dto.modal';
import { Devis } from '../../models/devis.modal';
import { DemandeService } from '../../services/demande.service';
import { NotificationService } from '../../services/notification.service';
import {
  addDemande,
  createDemande,
  erreurDemandes,
  findAllDemandes,
  loadDemandes,
  setDemande,
  updateDemande
} from './demande.actions';

@Injectable()
export class DemandeEffects {
  findAllDemandes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(findAllDemandes),
      mergeMap(({ state, page, size, sort }) =>
        this.parseLoadAllDevis(this.demandeService.getAllDemand(state, page, size, sort))
      )
    )
  );

  createDemande$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createDemande),
      mergeMap(({ demande }) => this.parseCreateDevi(this.demandeService.createDemand(demande)))
    )
  );

  updateDemande$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateDemande),
      mergeMap(({ demande }) =>
        this.parseUpdateDevi(this.demandeService.updateStatusDemand(demande))
      )
    )
  );

  constructor(
    private actions$: Actions,
    private translateService: TranslateService,
    private demandeService: DemandeService,
    private notificationService: NotificationService
  ) {}

  parseLoadAllDevis(obs: Observable<RequestResultDto<RequestResultPaginateDto<Devis[]>>>) {
    return obs.pipe(
      map((data: RequestResultDto<RequestResultPaginateDto<Devis[]>>) => {
        if (data.status === 'SUCCESS') {
          return loadDemandes({ demandes: data.data.content || [] });
        } else {
          return erreurDemandes({ messages: data.message || '' });
        }
      }),
      catchError(() =>
        of(erreurDemandes({ messages: this.translateService.instant('MESSAGES.ERRORS.LOAD') }))
      )
    );
  }

  parseUpdateDevi(obs: Observable<RequestResultDto<Devis>>) {
    return obs.pipe(
      map((data: RequestResultDto<Devis>) => {
        if (data.status === 'SUCCESS') {
          this.notificationService.showSuccess('Demande mise à jour avec succès!');
          return setDemande({ demande: data.data || {} });
        } else {
          const errorMsg = data.message || 'Erreur lors de la mise à jour';
          this.notificationService.showError(errorMsg);
          return erreurDemandes({ messages: errorMsg });
        }
      }),
      catchError((error) => {
        const errorMessage =
          error?.error?.message ||
          error?.message ||
          this.translateService.instant('MESSAGES.ERRORS.LOAD');
        this.notificationService.showError(errorMessage);
        return of(erreurDemandes({ messages: errorMessage }));
      })
    );
  }

  parseCreateDevi(obs: Observable<RequestResultDto<Devis>>) {
    return obs.pipe(
      map((data: RequestResultDto<Devis>) => {
        if (data.status === 'SUCCESS') {
          this.notificationService.showSuccess('Demande créée avec succès!');
          return addDemande({ demande: data.data || {} });
        } else {
          const errorMsg = data.message || 'Erreur lors de la création';
          this.notificationService.showError(errorMsg);
          return erreurDemandes({ messages: errorMsg });
        }
      }),
      catchError((error) => {
        const errorMessage =
          error?.error?.message ||
          error?.message ||
          this.translateService.instant('MESSAGES.ERRORS.LOAD');
        this.notificationService.showError(errorMessage);
        return of(erreurDemandes({ messages: errorMessage }));
      })
    );
  }
}
