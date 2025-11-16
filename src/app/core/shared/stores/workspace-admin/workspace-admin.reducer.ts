import { Action, createReducer, on } from '@ngrx/store';
import { DataStateEnum } from "src/app/core/config/data.state.enum";
import { WorkspaceAdminState, initialWorkspaceAdminState } from "./workspace-admin.state";
import {
  findAllWorkspaceAdmins,
  findWorkspaceAdminById,
  updateWorkspaceAdmin,
  deleteWorkspaceAdmin,
  reactivateWorkspaceAdmin,
  erreurWorkspaceAdmins,
  setWorkspaceAdmin,
  addWorkspaceAdmin,
  loadWorkspaceAdmins,
  removeWorkspaceAdmin
} from './workspace-admin.actions';

const reducer = createReducer(
  initialWorkspaceAdminState,

  on(findAllWorkspaceAdmins, (state) => ({
    ...state,
    dataState: DataStateEnum.LOADING
  })),

  on(findWorkspaceAdminById, (state) => ({
    ...state,
    dataState: DataStateEnum.LOADING
  })),

  on(updateWorkspaceAdmin, (state) => ({
    ...state,
    dataState: DataStateEnum.LOADING
  })),

  on(deleteWorkspaceAdmin, (state) => ({
    ...state,
    dataState: DataStateEnum.LOADING
  })),

  on(reactivateWorkspaceAdmin, (state) => ({
    ...state,
    dataState: DataStateEnum.LOADING
  })),

  on(loadWorkspaceAdmins, (state, { workspaceAdmins, totalElements, totalPages, currentPage, pageSize }) => ({
    ...state,
    workspaceAdmins: workspaceAdmins,
    totalElements: totalElements ?? state.totalElements,
    totalPages: totalPages ?? state.totalPages,
    currentPage: currentPage ?? state.currentPage,
    pageSize: pageSize ?? state.pageSize,
    dataState: DataStateEnum.SUCCESS,
    messages: ''
  })),

  on(setWorkspaceAdmin, (state, { workspaceAdmin }) => ({
    ...state,
    workspaceAdmin: workspaceAdmin,
    dataState: DataStateEnum.SUCCESS,
    messages: ''
  })),

  on(addWorkspaceAdmin, (state, { workspaceAdmin }) => ({
    ...state,
    workspaceAdmins: [...state.workspaceAdmins, workspaceAdmin],
    workspaceAdmin: workspaceAdmin,
    dataState: DataStateEnum.SUCCESS,
    messages: ''
  })),

  on(removeWorkspaceAdmin, (state, { workspaceAdminId }) => ({
    ...state,
    workspaceAdmins: state.workspaceAdmins.filter(admin => admin.id !== workspaceAdminId),
    dataState: DataStateEnum.SUCCESS,
    messages: ''
  })),

  on(erreurWorkspaceAdmins, (state, { messages }) => ({
    ...state,
    dataState: DataStateEnum.ERROR,
    messages: messages
  }))
);

export function WorkspaceAdminReducer(
  state: WorkspaceAdminState | undefined,
  action: Action
): WorkspaceAdminState {
  return reducer(state, action);
}

