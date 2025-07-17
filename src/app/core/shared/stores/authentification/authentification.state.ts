import { DataStateEnum } from "src/app/core/config/data.state.enum";
import { AuthentificationDto } from "../../dtos/authentification-dto.modal";

export interface AuthentificationState{
    dataState: DataStateEnum,
    authentificationDto: AuthentificationDto,
    message: string,
    messages: string,
}