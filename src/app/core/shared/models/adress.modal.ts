import { UserResponseDto } from "../dtos/user-response-dto.modal";

export class Adress{
    constructor(
        public id?: number,
        public rue?: string,
        public ville?: string,
        public codePostal?: string,
    ){}
}