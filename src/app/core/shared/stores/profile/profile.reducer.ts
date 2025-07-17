import { Action, createReducer, on } from '@ngrx/store';
import { erreurProfiles, setUserProfile, checkProfile, userLogin, } from './profile.actions';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { ProfileState } from './profile.state';

const initState: ProfileState = {
  user: {},
  dataState: DataStateEnum.INITIAL,
  isLogin: false,
  messages: ''
}

const reducer = createReducer(initState,
  on( setUserProfile, (state, {user}) => ({...state, user: user, dataState: DataStateEnum.SUCCESS})),
  on( userLogin, (state, {isLogin}) => ({...state,dataState: DataStateEnum.SUCCESS, isLogin: isLogin})),
  on( checkProfile,
     state => ({ ...state, dataState: DataStateEnum.LOADING })),
  on(erreurProfiles, (state, {messages}) => ({...state, dataState: DataStateEnum.ERROR, messages: messages}))
);

export function profileReducer(
  state: ProfileState | undefined,
  action: Action
): ProfileState {
  return reducer(state, action);
}
