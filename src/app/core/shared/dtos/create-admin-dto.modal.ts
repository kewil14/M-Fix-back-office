export class CreateAdminDto {
    constructor(
        public email?: string,
        public firstName?: string,
        public lastName?: string,
        public isSuperAdmin?: boolean,
        public roleIds?: string[],
        public avatar?: string
    ) {}
}

