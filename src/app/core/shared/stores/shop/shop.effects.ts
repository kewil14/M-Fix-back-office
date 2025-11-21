import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { RequestResultDto } from '../../dtos/request-result-dto.modal';
import { ShopService } from '../../services/shop.service';
import { NotificationService } from '../../services/notification.service';
import { PermissionService } from '../../services/permission.service';
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
    private notificationService: NotificationService,
    private permissionService: PermissionService
  ) {}

  findAllShopsEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(findAllShops),
      mergeMap(({ workspaceId, filters }) => {
        console.log('ShopEffects - findAllShops called with workspaceId:', workspaceId, 'filters:', filters);
        if (!workspaceId) {
          console.error('ShopEffects - workspaceId is required');
          return of(erreurShops({ messages: 'WorkspaceId is required' }));
        }
        return this.shopService.getShops(workspaceId, filters).pipe(
          map((data: RequestResultDto<any>) => {
            console.log('ShopEffects - getShops response:', data);
            if (data.status === 'SUCCESS' && data.data) {
              let shops = Array.isArray(data.data) ? data.data : [];
              const totalElements = shops.length;
              console.log('ShopEffects - Shops loaded (before pagination):', totalElements);
              
              // Appliquer la pagination côté client
              const page = filters?.page || 0;
              const size = filters?.size || 10;
              const startIndex = page * size;
              const endIndex = startIndex + size;
              shops = shops.slice(startIndex, endIndex);
              
              console.log('ShopEffects - Shops after pagination:', shops.length, 'page:', page, 'size:', size);
              
              return loadShops({
                shops: shops,
                totalElements: totalElements,
                totalPages: Math.ceil(totalElements / size) || 1,
                currentPage: page,
                pageSize: size
              });
            } else {
              console.error('ShopEffects - Error in response:', data.message);
              return erreurShops({
                messages: data.message || 'Erreur lors de la récupération des shops'
              });
            }
          }),
          catchError((error) => {
            console.error('ShopEffects - HTTP Error:', error);
            if (isCriticalHttpError(error)) {
              throw error;
            }
            const errorMessage =
              error?.error?.message ||
              error?.message ||
              this.translateService.instant('MESSAGES.ERRORS.LOAD');
            return of(erreurShops({ messages: errorMessage }));
          })
        );
      })
    )
  );

  findShopByIdEffect = createEffect(() =>
    this.actions$.pipe(
      ofType(findShopById),
      mergeMap(({ workspaceId, shopId }) =>
        this.shopService.getShopById(workspaceId, shopId).pipe(
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
      mergeMap(({ workspaceId, createShopDto }) =>
        this.shopService.createShop(workspaceId, createShopDto).pipe(
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
      mergeMap(({ workspaceId, shopId, updateShopDto }) =>
        this.shopService.updateShop(workspaceId, shopId, updateShopDto).pipe(
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
      mergeMap(({ workspaceId, shopId }) =>
        this.shopService.deactivateShop(workspaceId, shopId).pipe(
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
      mergeMap(({ workspaceId, shopId }) =>
        this.shopService.activateShop(workspaceId, shopId).pipe(
          map((data: RequestResultDto<any>) => {
            if (data.status === 'SUCCESS') {
              this.notificationService.showSuccess('Shop réactivé avec succès!');
              return findShopById({ workspaceId, shopId });
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

