import { createAction, props } from "@ngrx/store";
import { AvisRequestDto } from "../../dtos/avis-request-dto.modal";
import { Avis } from "../../models/avis.modal";


export const erreurAvis = createAction('[Avis] avis/avis/erreurAvis', props<{messages: string}>());

export const setAvis = createAction('[Avis] avis/avis/setAvis', props<{ avis: Avis}>());
export const removeAvis = createAction('[Avis] avis/avis/removeAvis', props<{ message: string }>());
export const addAvis = createAction('[Avis] avis/avis/addAvis', props<{ avis: Avis}>());
export const loadAvi = createAction('[Avis] avis/avis/loadAvi', props<{ avis: Avis}>());
export const loadAvis = createAction('[Avis] avis/avis/loadAvis', props<{ avis: Array<Avis>}>());




//tous les avis de l'appli
export const findAllAvis = createAction('[Avis] avis/avis/findAllAvis');

// tous les avis par state
export const findAllAvisByState = createAction('[Avis] avis/avis/findAllAvisByState', props<{state: string}>());


//mettre a jour un avis dans le systeme
export const updateAvis = createAction('[Avis] avis/avis/updateAvis', props<{avis: AvisRequestDto}>());

//mettre a jour un avis et son status dans le systeme
export const updateStatusAvis = createAction('[Avis] avis/avis/updateStatusAvis', props<{avis: AvisRequestDto, status: boolean}>());

//delete 
export const deleteAvis = createAction('[Avis] avis/avis/deleteAvis', props<{id: string}>());

//create 
export const createAvis = createAction('[Avis] avis/avis/createAvis', props<{avis: AvisRequestDto}>());

