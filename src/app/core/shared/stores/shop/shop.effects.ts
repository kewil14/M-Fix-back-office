import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { RequestResultDto } from '../../dtos/request-result-dto.modal';
import { ShopService } from '../../services/shop.service';
import { NotificationService } from '../../services/notification.service';
import { isCriticalHttpError } from '../../utils/error-handler.util';
import {
  findAllShops,
  findShopById,
  createShop,
  updateShop,
  deleteShop,
  reactivateShop,
  erreurShops,
  setShop,
  addShop,
  loadShops,
  removeShop
} from './shop.actions';

@Injectable()
export class ShopEffects {
  constructor(
    private actions$: Actions,
    private shopService: ShopService,
    private storeService: Store,
    private translateService: TranslateService,
    private notificationService: NotificationService
  ) {}

  findAllShopsEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(findAllShops),
      mergeMap(({ filters }) =>
        this.shopService.getShops(filters).pipe(
          map((data: RequestResultDto<any>) => {
            if (data.status === 'SUCCESS' && data.data) {
              return loadShops({
                shops: data.data.content || [],
                totalElements: data.data.totalElements || 0,
                totalPages: data.data.totalPages || 0,
                currentPage: data.data.number || 0,
                pageSize: data.data.size || 10
              });
            } else {
              return erreurShops({
                messages: data.message || 'Erreur lors de la récupération des shops'
              });
            }
          }),
          catchError((error) => {
            if (isCriticalHttpError(error)) {
              throw error;
            }
            const errorMessage =
              error?.error?.message ||
              error?.message ||
              this.translateService.instant('MESSAGES.ERRORS.LOAD');
            return of(erreurShops({ messages: errorMessage }));
          })
        )
      )
    )
  );

  findShopByIdEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(findShopById),
      mergeMap(({ shopId }) =>
        this.shopService.getShopById(shopId).pipe(
          map((data: RequestResultDto<any>) => {
            if (data.status === 'SUCCESS' && data.data) {
              return setShop({ shop: data.data });
            } else {
              return erreurShops({
                messages: data.message || "Erreur lors de la récupération du shop"
              });
            }
          }),
          catchError((error) => {
            if (isCriticalHttpError(error)) {
              throw error;
            }
            const errorMessage =
              error?.error?.message ||
              error?.message ||
              this.translateService.instant('MESSAGES.ERRORS.LOAD');
            return of(erreurShops({ messages: errorMessage }));
          })
        )
      )
    )
  );

  createShopEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(createShop),
      mergeMap(({ createShopDto }) =>
        this.shopService.createShop(createShopDto).pipe(
          map((data: RequestResultDto<any>) => {
            if (data.status === 'SUCCESS' && data.data) {
              this.notificationService.showSuccess('Shop créé avec succès!');
              return addShop({ shop: data.data });
            } else {
              return erreurShops({
                messages: data.message || "Erreur lors de la création du shop"
              });
            }
          }),
          catchError((error) => {
            if (isCriticalHttpError(error)) {
              throw error;
            }
            const errorMessage =
              error?.error?.message ||
              error?.message ||
              this.translateService.instant('MESSAGES.ERRORS.SAVE');
            this.notificationService.showError(errorMessage);
            return of(erreurShops({ messages: errorMessage }));
          })
        )
      )
    )
  );

  updateShopEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(updateShop),
      mergeMap(({ shopId, updateShopDto }) =>
        this.shopService.updateShop(shopId, updateShopDto).pipe(
          map((data: RequestResultDto<any>) => {
            if (data.status === 'SUCCESS' && data.data) {
              this.notificationService.showSuccess('Shop mis à jour avec succès!');
              return setShop({ shop: data.data });
            } else {
              return erreurShops({
                messages: data.message || "Erreur lors de la mise à jour du shop"
              });
            }
          }),
          catchError((error) => {
            if (isCriticalHttpError(error)) {
              throw error;
            }
            const errorMessage =
              error?.error?.message ||
              error?.message ||
              this.translateService.instant('MESSAGES.ERRORS.UPDATE');
            this.notificationService.showError(errorMessage);
            return of(erreurShops({ messages: errorMessage }));
          })
        )
      )
    )
  );

  deleteShopEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteShop),
      mergeMap(({ shopId }) =>
        this.shopService.deleteShop(shopId).pipe(
          map((data: RequestResultDto<any>) => {
            if (data.status === 'SUCCESS') {
              this.notificationService.showSuccess('Shop désactivé avec succès!');
              return removeShop({ shopId });
            } else {
              return erreurShops({
                messages: data.message || "Erreur lors de la désactivation du shop"
              });
            }
          }),
          catchError((error) => {
            if (isCriticalHttpError(error)) {
              throw error;
            }
            const errorMessage =
              error?.error?.message ||
              error?.message ||
              this.translateService.instant('MESSAGES.ERRORS.DELETE');
            this.notificationService.showError(errorMessage);
            return of(erreurShops({ messages: errorMessage }));
          })
        )
      )
    )
  );

  reactivateShopEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(reactivateShop),
      mergeMap(({ shopId }) =>
        this.shopService.reactivateShop(shopId).pipe(
          map((data: RequestResultDto<any>) => {
            if (data.status === 'SUCCESS') {
              this.notificationService.showSuccess('Shop réactivé avec succès!');
              return findShopById({ shopId });
            } else {
              return erreurShops({
                messages: data.message || "Erreur lors de la réactivation du shop"
              });
            }
          }),
          catchError((error) => {
            if (isCriticalHttpError(error)) {
              throw error;
            }
            const errorMessage =
              error?.error?.message ||
              error?.message ||
              this.translateService.instant('MESSAGES.ERRORS.UPDATE');
            this.notificationService.showError(errorMessage);
            return of(erreurShops({ messages: errorMessage }));
          })
        )
      )
    )
  );
}

