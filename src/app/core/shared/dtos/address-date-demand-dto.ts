export class AddressDateDemandDto {
    constructor(
        public from_date?: string,
        public to_date?: string,
        public address_start?: string,
        public address_end?: string,
    ){}
}

