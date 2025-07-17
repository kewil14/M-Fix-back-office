import { DevisState } from "./devis.state";

import { Action, createReducer, on } from '@ngrx/store';
import { DataStateEnum } from "src/app/core/config/data.state.enum";
import { addDevis, createDevis, deleteDevis, erreurDevis, findAllDevis, loadDevi, loadDevis, removeDevis, setDevis, updateDevis } from "./devis.actions";

const initState: DevisState = {
    dataState: DataStateEnum.INITIAL,
    devi: {},
    devis: [],
    messages: '',
}

const reducer = createReducer(initState,
    on(loadDevi, (state, {devi}) => ({...state, devi: devi, dataState: DataStateEnum.SUCCESS, messages: ''})),
    
    on(loadDevis, (state, {devis}) => ({...state, devis: devis, dataState: DataStateEnum.SUCCESS, messages: ''})),
    
    on(addDevis, (state, {devi}) => {
      let devis = [...state.devis];
      devis.push(devi);
      return {...state, devis: devis, devi: devi, dataState: DataStateEnum.SUCCESS, messages: ''}
    }),

    on(setDevis, (state, {devi}) => {
      let devis = [...state.devis];
      devis = devis.filter(u => u.idDevis !== devi.idDevis);
      devis.push(devi);
      return {...state, devi: devi, devis: devis, dataState: DataStateEnum.SUCCESS, messages: ''}
    }),
    
    on(removeDevis, (state, {message}) => {
      let devis = [...state.devis];
      return {...state, dataState: DataStateEnum.SUCCESS, messages: message}
    }),

    on(addDevis, (state, {devi}) => {
      let devis = [...state.devis];
      devis.push(devi);
      return {...state, devis: devis, devi: devi, dataState: DataStateEnum.SUCCESS, messages: ''}
    }),


    
    on(erreurDevis, (state, {messages}) => ({...state, dataState: DataStateEnum.ERROR, messages: messages})),

    on( findAllDevis, updateDevis, deleteDevis,
      createDevis,  
    state => ({ ...state, dataState: DataStateEnum.LOADING, messages: '' }))
  );
  
  export function devisReducer(
    state: DevisState | undefined,
    action: Action
  ): DevisState {
    return reducer(state, action);
  }