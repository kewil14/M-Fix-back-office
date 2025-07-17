import { GrilleTarifaire } from "./grille-tarifaire.modal";

export class Devis{
    constructor(
        public idDevis?: number,
        public estimatedAmount?: number,
        public state?: string,
        public demandeId?: number,
        public grillesTarifairesIds?: GrilleTarifaire[],
        public isCreatedByAdmin?: boolean,
        public createdByAdmin?: boolean,
    ){}
}