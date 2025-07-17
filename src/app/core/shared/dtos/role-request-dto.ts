import { RoleItem } from "../models/users/role-item.modal";

export class RoleRequestDto {
    constructor(
        public roleCode?: string,
        public roleName?: string,
        public authorisationsCode?: string[],
        public roleDescription?: string,
        public state?: string,
    ){}
}
