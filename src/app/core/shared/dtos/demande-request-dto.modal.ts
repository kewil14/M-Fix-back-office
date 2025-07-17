import { Adress } from "../models/adress.modal";

export class DemandeRequestDto {
    constructor(
        public idDemande?: number,
        public dateDemande?: string,
        public dateDemenagement?: string,
        public description?: string,
        public adresseDepart?: Adress,
        public adresseDestination?: Adress,
        public state?: string,
        public userCode?: string,
    ) {}
}



