import { Action, createReducer, on } from "@ngrx/store";

import { SystemInitState } from "./system-init.state";
import { activateInit, checkConfigurationAction, checkStateAction, erreursSystemInit,  initialise, setState } from "./system-init.actions";
import { DataStateEnum } from "src/app/core/config/data.state.enum";


const initState: SystemInitState = {
    dataState: DataStateEnum.INITIAL,
    res: false,
    messages: '',
}

const reducer = createReducer(initState,
    on(erreursSystemInit, (state, {messages}) => ({...state, dataState: DataStateEnum.ERROR, messages: messages})),
    on(setState, initialise, (state) => ({...state, dataState: DataStateEnum.SUCCESS, messages: ''})),
    on(checkStateAction, checkConfigurationAction, activateInit, (state) => ({...state, dataState: DataStateEnum.LOADING})),
)

export function systemInitReducer(
    state: SystemInitState | undefined,
    action: Action
): SystemInitState {
    return reducer(state, action);
}
  