import { RoleResponseDto } from "./role-response-dto";

export class UserResponseDto {
    constructor(
        public userCode?: string,
        public userFirstName?: string,
        public userLastName?: string,
        public state?: string,
        public roles?: RoleResponseDto[],
        public userEmail?: string,
        public userPhoneNumber?: string,
        public isActive?: boolean,
        public isUserEmailVerified?: boolean,
        public image?: string,
        public isUserPhoneNumberVerified?: boolean,
        public userType?: string,
        public creationDate?: string,
    ) {}
}
