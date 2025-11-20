import { Action, createReducer, on } from '@ngrx/store';
import { DataStateEnum } from "src/app/core/config/data.state.enum";
import { ShopState, initialShopState } from "./shop.state";
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

const reducer = createReducer(
  initialShopState,

  on(findAllShops, (state) => ({
    ...state,
    dataState: DataStateEnum.LOADING
  })),

  on(findShopById, (state) => ({
    ...state,
    dataState: DataStateEnum.LOADING
  })),

  on(createShop, (state) => ({
    ...state,
    dataState: DataStateEnum.LOADING
  })),

  on(updateShop, (state) => ({
    ...state,
    dataState: DataStateEnum.LOADING
  })),

  on(deleteShop, (state) => ({
    ...state,
    dataState: DataStateEnum.LOADING
  })),

  on(reactivateShop, (state) => ({
    ...state,
    dataState: DataStateEnum.LOADING
  })),

  on(loadShops, (state, { shops, totalElements, totalPages, currentPage, pageSize }) => ({
    ...state,
    shops: shops,
    totalElements: totalElements ?? state.totalElements,
    totalPages: totalPages ?? state.totalPages,
    currentPage: currentPage ?? state.currentPage,
    pageSize: pageSize ?? state.pageSize,
    dataState: DataStateEnum.SUCCESS,
    messages: ''
  })),

  on(setShop, (state, { shop }) => ({
    ...state,
    shop: shop,
    dataState: DataStateEnum.SUCCESS,
    messages: ''
  })),

  on(addShop, (state, { shop }) => ({
    ...state,
    shops: [...state.shops, shop],
    shop: shop,
    dataState: DataStateEnum.SUCCESS,
    messages: ''
  })),

  on(removeShop, (state, { shopId }) => ({
    ...state,
    shops: state.shops.filter(s => s.id !== shopId),
    dataState: DataStateEnum.SUCCESS,
    messages: ''
  })),

  on(erreurShops, (state, { messages }) => ({
    ...state,
    dataState: DataStateEnum.ERROR,
    messages: messages
  }))
);

export function ShopReducer(
  state: ShopState | undefined,
  action: Action
): ShopState {
  return reducer(state, action);
}

