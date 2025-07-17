export class AddressNominatimResponseDto {
    constructor(
        public label?: string,
        public city?: string,
        public postcode?: string,
        public context?: string,
        public coordinates?: string,
        ){}
}
