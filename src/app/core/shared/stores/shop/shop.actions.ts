import { createAction, props } from "@ngrx/store";
import { ShopListRequestDto } from "../../dtos/shop-response-dto";
import { ShopResponseDto } from "../../dtos/shop-response-dto";
import { CreateShopDto, UpdateShopDto } from "../../dtos/shop-response-dto";

export const erreurShops = createAction(
  '[Shop] shop/erreurShops', 
  props<{messages: string}>()
);

export const setShop = createAction(
  '[Shop] shop/setShop', 
  props<{ shop: ShopResponseDto}>()
);

export const addShop = createAction(
  '[Shop] shop/addShop', 
  props<{ shop: ShopResponseDto}>()
);

export const loadShops = createAction(
  '[Shop] shop/loadShops', 
  props<{ 
    shops: ShopResponseDto[];
    totalElements?: number;
    totalPages?: number;
    currentPage?: number;
    pageSize?: number;
  }>()
);

export const removeShop = createAction(
  '[Shop] shop/removeShop', 
  props<{ shopId: string }>()
);

export const findAllShops = createAction(
  '[Shop] shop/findAllShops', 
  props<{ filters: ShopListRequestDto }>()
);

export const findShopById = createAction(
  '[Shop] shop/findShopById', 
  props<{ shopId: string }>()
);

export const createShop = createAction(
  '[Shop] shop/createShop', 
  props<{ createShopDto: CreateShopDto }>()
);

export const updateShop = createAction(
  '[Shop] shop/updateShop', 
  props<{ shopId: string, updateShopDto: UpdateShopDto }>()
);

export const deleteShop = createAction(
  '[Shop] shop/deleteShop', 
  props<{ shopId: string }>()
);

export const reactivateShop = createAction(
  '[Shop] shop/reactivateShop', 
  props<{ shopId: string }>()
);

