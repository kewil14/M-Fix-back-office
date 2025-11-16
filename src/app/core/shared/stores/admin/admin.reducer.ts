import { Action, createReducer, on } from '@ngrx/store';
import { DataStateEnum } from "src/app/core/config/data.state.enum";
import { AdminState, initialAdminState } from "./admin.state";
import {
  findAllAdmins,
  findAdminById,
  createAdminNew,
  updateAdmin,
  deleteAdmin,
  reactivateAdmin,
  erreurAdmins,
  setAdmin,
  addAdmin,
  loadAdmins,
  removeAdmin
} from './admin.actions';

const reducer = createReducer(
  initialAdminState,

  on(findAllAdmins, (state) => ({
    ...state,
    dataState: DataStateEnum.LOADING
  })),

  on(findAdminById, (state) => ({
    ...state,
    dataState: DataStateEnum.LOADING
  })),

  on(createAdminNew, (state) => ({
    ...state,
    dataState: DataStateEnum.LOADING
  })),

  on(updateAdmin, (state) => ({
    ...state,
    dataState: DataStateEnum.LOADING
  })),

  on(deleteAdmin, (state) => ({
    ...state,
    dataState: DataStateEnum.LOADING
  })),

  on(reactivateAdmin, (state) => ({
    ...state,
    dataState: DataStateEnum.LOADING
  })),

  on(loadAdmins, (state, { admins, totalElements, totalPages, currentPage, pageSize }) => ({
    ...state,
    admins: admins,
    totalElements: totalElements ?? state.totalElements,
    totalPages: totalPages ?? state.totalPages,
    currentPage: currentPage ?? state.currentPage,
    pageSize: pageSize ?? state.pageSize,
    dataState: DataStateEnum.SUCCESS,
    messages: ''
  })),

  on(setAdmin, (state, { admin }) => ({
    ...state,
    admin: admin,
    dataState: DataStateEnum.SUCCESS,
    messages: ''
  })),

  on(addAdmin, (state, { admin }) => ({
    ...state,
    admins: [...state.admins, admin],
    admin: admin,
    dataState: DataStateEnum.SUCCESS,
    messages: ''
  })),

  on(removeAdmin, (state, { adminId }) => ({
    ...state,
    admins: state.admins.filter(admin => admin.id !== adminId),
    dataState: DataStateEnum.SUCCESS,
    messages: ''
  })),

  on(erreurAdmins, (state, { messages }) => ({
    ...state,
    dataState: DataStateEnum.ERROR,
    messages: messages
  }))
);

export function adminReducer(
  state: AdminState | undefined,
  action: Action
): AdminState {
  return reducer(state, action);
}

