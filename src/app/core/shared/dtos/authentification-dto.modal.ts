
export class AuthentificationDto {
    constructor(
        public jwt?: string,
        public prefix?: string,
        public status?: string,
        public type?: string,
        public messages?: Array<string>
    ) {}
}
