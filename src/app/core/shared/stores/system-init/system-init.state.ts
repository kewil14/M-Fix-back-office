import { DataStateEnum } from "src/app/core/config/data.state.enum";

export interface SystemInitState{
    dataState: DataStateEnum,
    res: boolean;
    messages?: string,
}