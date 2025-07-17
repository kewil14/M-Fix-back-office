import { Action, createReducer, on } from '@ngrx/store';
import { DataStateEnum } from "src/app/core/config/data.state.enum";
import { AddressState } from './address.state';
import { erreurAdress, findAllAdress, loadAdress } from './address.actions';

const initState: AddressState = {
    dataState: DataStateEnum.INITIAL,
    address: {},
    adresses: [],
    messages: '',
}

const reducer = createReducer(initState,
    
    on(loadAdress, (state, {adress}) => ({...state, adresses: adress, dataState: DataStateEnum.SUCCESS, messages: ''})),
    
    
    on(erreurAdress, (state, {messages}) => ({...state, dataState: DataStateEnum.ERROR, messages: messages})),

    on( findAllAdress,
    state => ({ ...state, dataState: DataStateEnum.LOADING, messages: '' }))
  );
  
  export function adressReducer(
    state: AddressState | undefined,
    action: Action
  ): AddressState {
    return reducer(state, action);
  }