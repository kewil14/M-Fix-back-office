import { Action, createReducer, on } from '@ngrx/store';
import { DataStateEnum } from "src/app/core/config/data.state.enum";
import { AvisState } from './avis.state';
import { addAvis, createAvis, deleteAvis, erreurAvis, findAllAvis, findAllAvisByState, loadAvi, loadAvis, removeAvis, setAvis, updateAvis, updateStatusAvis } from './avis.actions';

const initState: AvisState = {
    dataState: DataStateEnum.INITIAL,
    avi: {},
    avis: [],
    messages: '',
}

const reducer = createReducer(initState,
    
    on(loadAvi, (state, {avis}) => ({...state, avi: avis, dataState: DataStateEnum.SUCCESS, messages: ''})),
    on(loadAvis, (state, {avis}) => ({...state, avis: avis, dataState: DataStateEnum.SUCCESS, messages: ''})),
    
    on(addAvis, (state, {avis}) => {
      let avisStore = [...state.avis];
      avisStore.push(avis);
      return {...state, avi: avis, dataState: DataStateEnum.SUCCESS, messages: ''}
    }),

    on(setAvis, (state, {avis}) => {
      let avisStore = [...state.avis];
      avisStore = avisStore.filter(u => u.id !== avis.id);
      avisStore.push(avis);
      return {...state, avi: avis, avis: avisStore, dataState: DataStateEnum.SUCCESS, messages: ''}
    }),
    
    on(removeAvis, (state, {message}) => {
      let avis = [...state.avis];
      // avis = avis.filter(u => u.id !== user.id);
      return {...state, dataState: DataStateEnum.SUCCESS, messages: message}
    }),
    
    on(erreurAvis, (state, {messages}) => ({...state, dataState: DataStateEnum.ERROR, messages: messages})),

    on( findAllAvis, updateAvis, updateStatusAvis,
      deleteAvis, createAvis, findAllAvisByState,
    state => ({ ...state, dataState: DataStateEnum.LOADING, messages: '' }))
  );
  
  export function avisReducer(
    state: AvisState | undefined,
    action: Action
  ): AvisState {
    return reducer(state, action);
  }