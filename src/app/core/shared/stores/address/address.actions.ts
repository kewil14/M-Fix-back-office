import { createAction, props } from "@ngrx/store";
import { AddressNominatimResponseDto } from "../../dtos/address-nominatim-response-dto";


export const erreurAdress = createAction('[Adress] adress/adress/erreurAvis', props<{messages: string}>());

export const loadAdress = createAction('[Adress] adress/adress/loadAdress', props<{ adress: Array<AddressNominatimResponseDto>}>());




//tous les adress de l'appli
export const findAllAdress = createAction('[Adress] adress/adress/findAllAdress', props<{q: string}>());


