import { DataStateEnum } from "src/app/core/config/data.state.enum";
import { Devis } from "../../models/devis.modal";

export interface DevisState{
    dataState: DataStateEnum,
    devi: Devis,
    devis: Devis[],
    messages: string,
}
