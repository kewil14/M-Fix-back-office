import { UserResponseDto } from "../dtos/user-response-dto.modal";

export class Avis{
    constructor(
        public id?: number,
        public description?: string,
        public note?: number,
        public isValidated?: boolean,
        public state?: string,
        public user?: UserResponseDto,
        public isAccountNonLocked?: boolean,
        public accountNonExpired?: boolean,
        public credentialsNonExpired?: boolean,
    ){}
}