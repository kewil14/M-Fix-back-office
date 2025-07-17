import { RoleItem } from "../models/users/role-item.modal";

export class RoleResponseDto {
    constructor(
        public authorisations?:Array<RoleItem>,
        public roleCode?: string,
        public roleDescription?: string,
        public roleName?: string,
    ){}
}
// "roleCode": "string",
// "roleName": "string",
// "authorisationsCode": [
//   "CREATE_ROLE"
// ],
// "roleDescription": "string",
// "state": "ACTIVE"