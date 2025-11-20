import { Action, createReducer, on } from '@ngrx/store';
import { DataStateEnum } from "src/app/core/config/data.state.enum";
import { WorkspaceState, initialWorkspaceState } from "./workspace.state";
import {
  findAllWorkspaces,
  findWorkspaceById,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  reactivateWorkspace,
  erreurWorkspaces,
  setWorkspace,
  addWorkspace,
  loadWorkspaces,
  removeWorkspace
} from './workspace.actions';

const reducer = createReducer(
  initialWorkspaceState,

  on(findAllWorkspaces, (state) => ({
    ...state,
    dataState: DataStateEnum.LOADING
  })),

  on(findWorkspaceById, (state) => ({
    ...state,
    dataState: DataStateEnum.LOADING
  })),

  on(createWorkspace, (state) => ({
    ...state,
    dataState: DataStateEnum.LOADING
  })),

  on(updateWorkspace, (state) => ({
    ...state,
    dataState: DataStateEnum.LOADING
  })),

  on(deleteWorkspace, (state) => ({
    ...state,
    dataState: DataStateEnum.LOADING
  })),

  on(reactivateWorkspace, (state) => ({
    ...state,
    dataState: DataStateEnum.LOADING
  })),

  on(loadWorkspaces, (state, { workspaces, totalElements, totalPages, currentPage, pageSize }) => ({
    ...state,
    workspaces: workspaces,
    totalElements: totalElements ?? state.totalElements,
    totalPages: totalPages ?? state.totalPages,
    currentPage: currentPage ?? state.currentPage,
    pageSize: pageSize ?? state.pageSize,
    dataState: DataStateEnum.SUCCESS,
    messages: ''
  })),

  on(setWorkspace, (state, { workspace }) => ({
    ...state,
    workspace: workspace,
    dataState: DataStateEnum.SUCCESS,
    messages: ''
  })),

  on(addWorkspace, (state, { workspace }) => ({
    ...state,
    workspaces: [...state.workspaces, workspace],
    workspace: workspace,
    dataState: DataStateEnum.SUCCESS,
    messages: ''
  })),

  on(removeWorkspace, (state, { workspaceId }) => ({
    ...state,
    workspaces: state.workspaces.filter(ws => ws.id !== workspaceId),
    dataState: DataStateEnum.SUCCESS,
    messages: ''
  })),

  on(erreurWorkspaces, (state, { messages }) => ({
    ...state,
    dataState: DataStateEnum.ERROR,
    messages: messages
  }))
);

export function WorkspaceReducer(
  state: WorkspaceState | undefined,
  action: Action
): WorkspaceState {
  return reducer(state, action);
}

