import { GroupRoleItem } from "../models/users/group-role-item.modal";

export class AutorisationResponseDto {
    constructor(
        public authorisationDescription?: string,
        public authorisationGroup?: GroupRoleItem,
        public authorisationKey?: string,
        public authorisationName?: string,
        public roleCode?: string,
        public roleDescription?: string,
        public roleName?: string,
    ){}
}
