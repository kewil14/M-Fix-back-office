import { AutorisationResponseDto } from "./autorisation-response-dto";

export class GroupItemsFinDto {
    constructor(
        public group?: string,
        public items?: Array<AutorisationResponseDto>
    ) {}
}