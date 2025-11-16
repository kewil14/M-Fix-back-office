export class ValidateTokenResponseDto {
    constructor(
        public valid?: boolean,
        public userId?: string,
        public email?: string,
        public userType?: string,
        public workspaceId?: string,
        public shopId?: string,
        public requirePasswordChange?: boolean,
        public expiresAt?: string
    ) {}
}

