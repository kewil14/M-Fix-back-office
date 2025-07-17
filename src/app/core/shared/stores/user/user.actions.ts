import { createAction, props } from "@ngrx/store";
import { UserResponseDto } from "../../dtos/user-response-dto.modal";
import { UserRequestDto } from "../../dtos/user-request-dto.modal";

export const erreurUsers = createAction('[UserResponseDto] authentification/user/erreurUsers', props<{messages: string}>());

export const setUser = createAction('[UserResponseDto] authentification/user/setUser', props<{ user: UserResponseDto}>());
export const removeUser = createAction('[UserResponseDto] authentification/user/removeUser', props<{ user: UserResponseDto }>());
export const addUser = createAction('[UserResponseDto] authentification/user/addUser', props<{ user: UserResponseDto}>());
export const loadUser = createAction('[UserResponseDto] authentification/user/loadUser', props<{ user: UserResponseDto}>());
export const loadUsers = createAction('[UserResponseDto] authentification/user/loadUsers', props<{ users: Array<UserResponseDto>}>());




//tous les user de l'appli
export const findAllUsers = createAction('[UserResponseDto] authentification/user/findAllUsers', props<{
    state?: string, 
    userType?: string, 
    startDate?: string, 
    endDate?: string, 
    page: number,
    size: number,
    sort: string,
}>());

export const findConnectedUser = createAction('[UserResponseDto] authentification/user/findConnectedUser');

//mettre a jour un user dans le systeme
export const updateUser = createAction('[UserResponseDto] authentification/user/updateUser', props<{user: UserRequestDto}>());

//delete 
export const deleteUser = createAction('[UserResponseDto] authentification/user/deleteUser', props<{userCode: string}>());


// create account
export const createUser = createAction('[UserResponseDto] authentification/user/createUser', props<{user: UserRequestDto}>());


