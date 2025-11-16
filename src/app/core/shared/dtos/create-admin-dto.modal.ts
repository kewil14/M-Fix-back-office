export class CreateAdminDto {
    constructor(
        public email?: string,
        public firstName?: string,
        public lastName?: string,
        public roleIds?: string[]
    ) {}
}

