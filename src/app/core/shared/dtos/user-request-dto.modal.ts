import { RoleResponseDto } from "./role-response-dto";

export class UserRequestDto {
    constructor(
        public userCode?: string,
        public userFirstName?: string,
        public userLastName?: string,
        public state?: string,
        public roles?: RoleResponseDto[],
        public userEmail?: string,
        public country?: string,
        public userPhoneNumber?: string,
        public userPassword?: string,
        public isActive?: boolean,
        public isUserEmailVerified?: boolean,
        public image?: string,
        public isUserPhoneNumberVerified?: boolean,
        public userType?: string,
        public creationDate?: string,
        public workspaceId?: string,
        public shopId?: string,
    ) {}
}
