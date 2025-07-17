import { createAction, props } from "@ngrx/store";
import { DevisRequestDto } from "../../dtos/devis-request-dto.modal";
import { Devis } from "../../models/devis.modal";
import { RequestResultPaginateDto } from '../../dtos/request-result-paginate-dto.modal';


export const erreurDevis = createAction('[Devis] devis/devis/erreurDeviss', props<{messages: string}>());

export const setDevis = createAction('[Devis] devis/devis/setDevis', props<{ devi: Devis}>());
export const removeDevis = createAction('[Devis] devis/devis/removeDevis', props<{ message: string }>());
export const addDevis = createAction('[Devis] devis/devis/addDevis', props<{ devi: Devis}>());
export const loadDevi = createAction('[Devis] devis/devis/loadDevis', props<{ devi: Devis}>());
export const loadDevis = createAction('[Devis] devis/devis/loadDeviss', props<{ devis: Array<Devis>}>());


//tous les devis de l'appli
export const findAllDevis = createAction('[Devis] devis/devis/findAllDevis', props<{
    userCode?: string, 
    state?: string, 
    startDate?: string, 
    endDate?: string, 
    page: number,
    size: number,
    sort: string,
}>());


//mettre a jour un devis dans le systeme
export const updateDevis = createAction('[Devis] devis/devis/updateDevis', props<{devis: DevisRequestDto}>());

//delete 
export const deleteDevis = createAction('[Devis] devis/devis/deleteDevis', props<{devisCode: string}>());

//create 
export const createDevis = createAction('[Devis] devis/devis/createDevis', props<{devis: DevisRequestDto}>());

