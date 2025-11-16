import { Action, createReducer, on } from "@ngrx/store";
import { connexion, connexionOk, erreursAuthentification,
    resetPasswordAction, resetPasswordActionOk,
    activateAccountOk, activateAccountPlayer,
    sendTokenResetPassword,
    messageAuthentification,
    validateActivationToken,
    validateActivationTokenOk,
    activateAccountWithToken,
    activateAccountWithTokenOk,
    createSuperAdmin,
    createSuperAdminOk,
    createAdmin,
    createAdminOk,
    createWorkspaceWithAdmin,
    createWorkspaceWithAdminOk,
    createEmployee,
    createEmployeeOk
} from "./authentification.actions";
import { AuthentificationState } from "./authentification.state";
import { DataStateEnum } from "src/app/core/config/data.state.enum";


const initState: AuthentificationState = {
    dataState: DataStateEnum.INITIAL,
    authentificationDto: {},
    message: '',
    messages: ''
}

const reducer = createReducer(initState,
    on(erreursAuthentification, (state, { messages }) => ({ ...state, dataState: DataStateEnum.ERROR, messages: messages })),
    on(messageAuthentification, (state, {message}) => ({...state, dataState: DataStateEnum.SUCCESS, message: message})),
    on(connexionOk, resetPasswordActionOk, activateAccountOk, validateActivationTokenOk, activateAccountWithTokenOk, 
       createSuperAdminOk, createAdminOk, createWorkspaceWithAdminOk, createEmployeeOk, (state) => ({...state, dataState: DataStateEnum.SUCCESS, messages: ''})),
    on(connexion, resetPasswordAction, activateAccountPlayer, sendTokenResetPassword, activateAccountWithToken, validateActivationToken,
       createSuperAdmin, createAdmin, createWorkspaceWithAdmin, createEmployee, (state) => ({...state, dataState: DataStateEnum.LOADING})),
)

export function AuthentificationReducer(
    state: AuthentificationState | undefined,
    action: Action
): AuthentificationState {
    return reducer(state, action);
}
  