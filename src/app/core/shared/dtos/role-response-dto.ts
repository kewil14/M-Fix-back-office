import { RoleItem } from "../models/users/role-item.modal";
import { PermissionDto } from "./permission-dto";

export class RoleResponseDto {
    constructor(
        public id?: string,
        public authorisations?:Array<RoleItem>,
        public roleCode?: string,
        public code?: string,
        public roleDescription?: string,
        public description?: string,
        public roleName?: string,
        public name?: string,
        public workspaceId?: string,
        public isSystemRole?: boolean,
        public priority?: number,
        public permissions?: PermissionDto[],
        public createdAt?: string,
        public updatedAt?: string,
    ){}
}