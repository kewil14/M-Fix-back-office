import { GroupCodeEnum } from "src/app/core/config/data.state.enum";

export class GroupRoleItem {
    constructor(
        public groupCode?: GroupCodeEnum,
        public groupDescription?: string,
        public groupName?: string,
    ) {}
}