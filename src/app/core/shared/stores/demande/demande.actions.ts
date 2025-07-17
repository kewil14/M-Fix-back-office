import { createAction, props } from "@ngrx/store";
import { DemandeRequestDto } from "../../dtos/demande-request-dto.modal";
import { Demande } from '../../models/demande.modal';
import { AddressDateDemandDto } from "../../dtos/address-date-demand-dto";


export const erreurDemandes = createAction('[Demandes] erreurDemandess', props<{messages: string}>());

export const setDemande = createAction('[Demandes] setDemande', props<{ demande: Demande}>());
export const removeDemandes = createAction('[Demandes] removeDemandes', props<{ message: string }>());
export const addDemande = createAction('[Demandes] addDemande', props<{ demande: Demande}>());
export const loadDemande = createAction('[Demandes] loadDemande', props<{ demande: Demande}>());
export const loadDemandes = createAction('[Demandes] loadDemandes', props<{ demandes: Array<Demande>}>());


export const saveAdressDateDemandes = createAction('[Demandes] saveAdressDateDemandes', props<{ demande: AddressDateDemandDto}>());


//tous les  de l'appli
export const findAllDemandes = createAction('[Demandes] findAllDemandes', props<{
    state: string, 
    page: number,
    size: number,
    sort: string,
}>());

export const findUserDemandes = createAction('[Demandes] findUserDemandes', props<{
    userCode: string, 
    state: string,
}>());


export const findByIdDemande = createAction('[Demandes] findByIdDemande', props<{
    idDemande: string, 
}>());


//mettre a jour un  dans le systeme
export const updateDemande = createAction('[Demandes] updateDemande', props<{demande: DemandeRequestDto}>());

//delete 
export const deleteDemandes = createAction('[Demandes] deleteDemandes', props<{Code: string}>());

//create 
export const createDemande = createAction('[Demandes] createDemande', props<{demande: DemandeRequestDto}>());

