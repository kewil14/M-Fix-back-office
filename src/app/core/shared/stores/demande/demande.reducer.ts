
import { Action, createReducer, on } from '@ngrx/store';
import { DataStateEnum } from "src/app/core/config/data.state.enum";
import { DemandeState } from './demande.state';
import { addDemande, createDemande, deleteDemandes, erreurDemandes, findAllDemandes, findByIdDemande, findUserDemandes, loadDemande, loadDemandes, removeDemandes, setDemande, updateDemande } from './demande.actions';

const initState: DemandeState = {
    dataState: DataStateEnum.INITIAL,
    demande: {},
    demandeStart: {},
    demandes: [],
    messages: '',
}

const reducer = createReducer(initState,
    on(loadDemande, (state, {demande}) => ({...state, demande: demande, dataState: DataStateEnum.SUCCESS, messages: ''})),
    
    on(loadDemandes, (state, {demandes}) => ({...state, demandes: demandes, dataState: DataStateEnum.SUCCESS, messages: ''})),
    
    on(addDemande, (state, {demande}) => {
      let demandes = [...state.demandes];
      demandes.push(demande);
      return {...state, demandes: demandes, demande: demande, dataState: DataStateEnum.SUCCESS, messages: ''}
    }),

    on(setDemande, (state, {demande}) => {
      let demandes = [...state.demandes];
      demandes = demandes.filter(u => u.id !== demande.id);
      demandes.push(demande);
      return {...state, demande: demande, demandes: demandes, dataState: DataStateEnum.SUCCESS, messages: ''}
    }),
    
    on(removeDemandes, (state, {message}) => {
      let demandes = [...state.demandes];
      return {...state, dataState: DataStateEnum.SUCCESS, messages: message}
    }),


    
    on(erreurDemandes, (state, {messages}) => ({...state, dataState: DataStateEnum.ERROR, messages: messages})),

    on( createDemande, deleteDemandes, updateDemande,
      findByIdDemande,  findUserDemandes, findAllDemandes,
    state => ({ ...state, dataState: DataStateEnum.LOADING, messages: '' }))
  );
  
  export function demandeReducer(
    state: DemandeState | undefined,
    action: Action
  ): DemandeState {
    return reducer(state, action);
  }