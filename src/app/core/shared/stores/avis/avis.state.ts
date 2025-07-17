import { DataStateEnum } from "src/app/core/config/data.state.enum";
import { Avis } from "../../models/avis.modal";

export interface AvisState{
    dataState: DataStateEnum,
    avi: Avis,
    avis: Avis[],
    messages: string,
}
