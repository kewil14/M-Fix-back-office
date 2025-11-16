export class WorkspaceDto {
    constructor(
        public name?: string,
        public type?: string, // REPAIR_SHOP, RETAIL, etc.
        public subscriptionPlan?: string // FREE, BASIC, PREMIUM
    ) {}
}

export class CreateWorkspaceAdminDto {
    constructor(
        public email?: string,
        public firstName?: string,
        public lastName?: string,
        public roleIds?: string[]
    ) {}
}

export class CreateWorkspaceWithAdminDto {
    constructor(
        public workspace?: WorkspaceDto,
        public admin?: CreateWorkspaceAdminDto
    ) {}
}

