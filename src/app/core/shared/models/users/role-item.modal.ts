import { GroupRoleItem } from "./group-role-item.modal";

export class RoleItem{
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
