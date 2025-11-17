export class InvitationResponseDto {
    constructor(
        public userId?: string,
        public email?: string,
        public firstName?: string,
        public lastName?: string,
        public phoneNumber?: string,
        public avatar?: string,
        public type?: string,
        public invitationId?: string,
        public invitationCreatedAt?: string,
        public invitationExpiresAt?: string,
        public isInvitationExpired?: boolean,
        public isInvitationUsed?: boolean,
        public daysUntilExpiration?: number,
        public status?: string
    ) {}
}

export class InvitationListResponseDto {
    constructor(
        public totalPages?: number,
        public totalElements?: number,
        public size?: number,
        public content?: InvitationResponseDto[],
        public number?: number,
        public sort?: {
            empty?: boolean;
            sorted?: boolean;
            unsorted?: boolean;
        },
        public pageable?: {
            offset?: number;
            sort?: {
                empty?: boolean;
                sorted?: boolean;
                unsorted?: boolean;
            };
            paged?: boolean;
            pageNumber?: number;
            pageSize?: number;
            unpaged?: boolean;
        },
        public numberOfElements?: number,
        public first?: boolean,
        public last?: boolean,
        public empty?: boolean
    ) {}
}

