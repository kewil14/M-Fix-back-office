
export class DevisRequestDto {
    constructor(
        public idDevis?: number,
        public estimatedAmount?: number,
        public state?: string,
        public demandeId?: number,
        public grillesTarifairesIds?: number[],
        public isCreatedByAdmin?: boolean,
        public createdByAdmin?: boolean,
    ) {}
}
