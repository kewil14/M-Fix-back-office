import { DataStateEnum } from "src/app/core/config/data.state.enum";
import { User } from "../../models/users/user.modal";

export interface ProfileState {
  dataState: DataStateEnum,
  user?: User,
  isLogin: boolean,
  messages: string
}
