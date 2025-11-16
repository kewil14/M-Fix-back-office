export class ActivateAccountDto {
    constructor(
        public token?: string,
        public newPassword?: string
    ) {}
}

