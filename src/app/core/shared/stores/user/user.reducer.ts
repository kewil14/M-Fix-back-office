import { UserState } from "./user.state";

import { Action, createReducer, on } from '@ngrx/store';
import { DataStateEnum } from "src/app/core/config/data.state.enum";
import { addUser, createUser, deleteUser, erreurUsers, findAllUsers, findConnectedUser, loadUser, loadUsers, removeUser, setUser, updateUser } from "./user.actions";

const initState: UserState = {
    dataState: DataStateEnum.INITIAL,
    user: {},
    users: [],
    messages: '',
}

const reducer = createReducer(initState,
    
    on(loadUser, (state, {user}) => ({...state, user: user, dataState: DataStateEnum.SUCCESS, messages: ''})),
    on(loadUsers, (state, {users}) => ({...state, users: users, dataState: DataStateEnum.SUCCESS, messages: ''})),
    
    on(addUser, (state, {user}) => {
      let users = [...state.users];
      users.push(user);
      return {...state, users: users, user: user, dataState: DataStateEnum.SUCCESS, messages: ''}
    }),

    on(setUser, (state, {user}) => {
      let users = [...state.users];
      users = users.filter(u => u.userCode !== user.userCode);
      users.push(user);
      return {...state, user: user, users: users, dataState: DataStateEnum.SUCCESS, messages: ''}
    }),
    
    on(removeUser, (state, {user}) => {
      let users = [...state.users];
      users = users.filter(u => u.userCode !== user.userCode);
      return {...state, dataState: DataStateEnum.SUCCESS, messages: ""}
    }),

    on(addUser, (state, {user}) => {
      let users = [...state.users];
      users.push(user);
      return {...state, users: users, user: user, dataState: DataStateEnum.SUCCESS, messages: ''}
    }),


    
    on(erreurUsers, (state, {messages}) => ({...state, dataState: DataStateEnum.ERROR, messages: messages})),

    on( findAllUsers, findConnectedUser, updateUser,
      deleteUser, createUser,
    state => ({ ...state, dataState: DataStateEnum.LOADING, messages: '' }))
  );
  
  export function userReducer(
    state: UserState | undefined,
    action: Action
  ): UserState {
    return reducer(state, action);
  }