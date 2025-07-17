import { DataStateEnum } from "src/app/core/config/data.state.enum";
import { Demande } from "../../models/demande.modal";
import { AddressDateDemandDto } from "../../dtos/address-date-demand-dto";

export interface DemandeState{
    dataState: DataStateEnum,
    demande: Demande,
    demandeStart: AddressDateDemandDto,
    demandes: Demande[],
    messages: string,
}
