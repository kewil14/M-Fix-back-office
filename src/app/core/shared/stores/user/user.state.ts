import { DataStateEnum } from "src/app/core/config/data.state.enum";
import { UserResponseDto } from "../../dtos/user-response-dto.modal";

export interface UserState{
    dataState: DataStateEnum,
    user: UserResponseDto,
    users: UserResponseDto[],
    messages: string,
}
