import { DataStateEnum } from "src/app/core/config/data.state.enum";
import { GrilleTarifaire } from "../../models/grille-tarifaire.modal";

export interface GrilleState{
    dataState: DataStateEnum,
    grille: GrilleTarifaire,
    grilles: GrilleTarifaire[],
    messages: string,
}
