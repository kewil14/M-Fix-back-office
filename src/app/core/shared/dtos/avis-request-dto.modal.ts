
export class AvisRequestDto {
    constructor(
        public idAvis?: number,
        public description?: string,
        public note?: number,
        public userId?: string,
        public state?: string,
        public isValidated?: boolean,
    ) {}
}
