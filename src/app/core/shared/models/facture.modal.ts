export class Facture{
    constructor(
        public idFacture?: string,
        public montantTotal?: number,
        public montantPaye?: number,
        public resteAPayer?: number,
        public date?: string,
        public state?: string,
        public devis?: number,
    ){}
}