import { UserResponseDto } from "../dtos/user-response-dto.modal";
import { Adress } from "./adress.modal";

export class Demand{
    constructor(
        public id?: number,
        public dateDemande?: string,
        public dateDemenagement?: string,
        public description?: string,
        public adresseDepart?: Adress,
        public adresseDestination?: Adress,
        public state?: string,
        public user?: UserResponseDto,
        public createdBy?: string,
        public createdDate?: string,
        public lastModifiedBy?: string,
        public lastModifiedDate?: string,
    ){}
}