export class InvitationListRequestDto {
    constructor(
        public workspaceId?: string,
        public shopId?: string,
        public userType?: string,
        public status?: string,
        public search?: string,
        public page?: number,
        public size?: number,
        public sortBy?: string,
        public sortDirection?: string
    ) {}
}

