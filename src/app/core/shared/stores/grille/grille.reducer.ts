import { GrilleState } from "./grille.state";

import { Action, createReducer, on } from '@ngrx/store';
import { DataStateEnum } from "src/app/core/config/data.state.enum";
import { addGrilles, createGrilles, deleteGrille, erreurGrilles, findAllGrilles, loadGrille, loadGrilles, removeGrille, setGrilles, updateGrilles } from "./grille.actions";

const initState: GrilleState = {
    dataState: DataStateEnum.INITIAL,
    grille: {},
    grilles: [],
    messages: '',
}

const reducer = createReducer(initState,
    on(loadGrille, (state, {grille}) => ({...state, grille: grille, dataState: DataStateEnum.SUCCESS, messages: ''})),
    
    on(loadGrilles, (state, {grilles}) => ({...state, grilles: grilles, dataState: DataStateEnum.SUCCESS, messages: ''})),
    
    on(addGrilles, (state, {grille}) => {
      let grilles = [...state.grilles];
      grilles.push(grille);
      return {...state, grilles: grilles, grille: grille, dataState: DataStateEnum.SUCCESS, messages: ''}
    }),

    on(setGrilles, (state, {grille}) => {
      let grilles = [...state.grilles];
      grilles = grilles.filter(u => u.id !== grille.id);
      grilles.push(grille);
      return {...state, grille: grille, grilles: grilles, dataState: DataStateEnum.SUCCESS, messages: ''}
    }),
    
    on(removeGrille, (state, {message}) => {
      let grilles = [...state.grilles];
      return {...state, dataState: DataStateEnum.SUCCESS, messages: message}
    }),

    


    
    on(erreurGrilles, (state, {messages}) => ({...state, dataState: DataStateEnum.ERROR, messages: messages})),

    on( findAllGrilles, updateGrilles, deleteGrille,
      createGrilles,  
    state => ({ ...state, dataState: DataStateEnum.LOADING, messages: '' }))
  );
  
  export function grilleReducer(
    state: GrilleState | undefined,
    action: Action
  ): GrilleState {
    return reducer(state, action);
  }