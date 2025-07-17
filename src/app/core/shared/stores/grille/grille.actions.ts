import { createAction, props } from "@ngrx/store";
import { GrilleTarifaire } from "../../models/grille-tarifaire.modal";
import { GrilleRequestDto } from "../../dtos/grille-request-dto.modal";


export const erreurGrilles = createAction('[GrilleTarifaire] grilles/grilles/erreurGrilless', props<{messages: string}>());

export const setGrilles = createAction('[GrilleTarifaire] grilles/grilles/setGrilles', props<{ grille: GrilleTarifaire}>());
export const removeGrille = createAction('[GrilleTarifaire] grilles/grilles/removeGrille', props<{ message: string }>());
export const addGrilles = createAction('[GrilleTarifaire] grilles/grilles/addGrilles', props<{ grille: GrilleTarifaire}>());
export const loadGrille = createAction('[GrilleTarifaire] grilles/grilles/loadGrilles', props<{ grille: GrilleTarifaire}>());
export const loadGrilles = createAction('[GrilleTarifaire] grilles/grilles/loadGrilless', props<{ grilles:Array<GrilleTarifaire>}>());


//tous les grilles de l'appli
export const findAllGrilles = createAction('[GrilleTarifaire] grilles/grilles/findAllGrilles',);


//mettre a jour un grilles dans le systeme
export const updateGrilles = createAction('[GrilleTarifaire] grilles/grilles/updateGrilles', props<{grille: GrilleRequestDto}>());

//delete 
export const deleteGrille = createAction('[GrilleTarifaire] grilles/grilles/deleteGrille', props<{grilleCode: string}>());

//create 
export const createGrilles = createAction('[GrilleTarifaire] grilles/grilles/createGrilles', props<{grilles: GrilleRequestDto}>());

