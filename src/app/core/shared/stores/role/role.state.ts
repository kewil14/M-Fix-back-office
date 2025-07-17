import { DataStateEnum } from "src/app/core/config/data.state.enum";
import { RoleResponseDto } from "../../dtos/role-response-dto";
import { AutorisationResponseDto } from "../../dtos/autorisation-response-dto";
import { GroupItemsFinDto } from "../../dtos/group-items-fin-dto.modal";

export interface RoleState{
    dataState: DataStateEnum,
    ruleItem: AutorisationResponseDto,
    ruleItems: AutorisationResponseDto[],
    rule: RoleResponseDto,
    rules: RoleResponseDto[],
    groupRoles: GroupItemsFinDto[],
    messages: string,
}
