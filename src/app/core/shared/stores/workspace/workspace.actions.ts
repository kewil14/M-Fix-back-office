import { createAction, props } from "@ngrx/store";
import { WorkspaceListRequestDto } from "../../dtos/workspace-response-dto";
import { WorkspaceResponseDto } from "../../dtos/workspace-response-dto";
import { CreateWorkspaceDto, UpdateWorkspaceDto } from "../../dtos/workspace-response-dto";

export const erreurWorkspaces = createAction(
  '[Workspace] workspace/erreurWorkspaces', 
  props<{messages: string}>()
);

export const setWorkspace = createAction(
  '[Workspace] workspace/setWorkspace', 
  props<{ workspace: WorkspaceResponseDto}>()
);

export const addWorkspace = createAction(
  '[Workspace] workspace/addWorkspace', 
  props<{ workspace: WorkspaceResponseDto}>()
);

export const loadWorkspaces = createAction(
  '[Workspace] workspace/loadWorkspaces', 
  props<{ 
    workspaces: WorkspaceResponseDto[];
    totalElements?: number;
    totalPages?: number;
    currentPage?: number;
    pageSize?: number;
  }>()
);

export const removeWorkspace = createAction(
  '[Workspace] workspace/removeWorkspace', 
  props<{ workspaceId: string }>()
);

export const findAllWorkspaces = createAction(
  '[Workspace] workspace/findAllWorkspaces', 
  props<{ filters: WorkspaceListRequestDto }>()
);

export const findWorkspaceById = createAction(
  '[Workspace] workspace/findWorkspaceById', 
  props<{ workspaceId: string }>()
);

export const createWorkspace = createAction(
  '[Workspace] workspace/createWorkspace', 
  props<{ createWorkspaceDto: CreateWorkspaceDto }>()
);

export const updateWorkspace = createAction(
  '[Workspace] workspace/updateWorkspace', 
  props<{ workspaceId: string, updateWorkspaceDto: UpdateWorkspaceDto }>()
);

export const deleteWorkspace = createAction(
  '[Workspace] workspace/deleteWorkspace', 
  props<{ workspaceId: string }>()
);

export const reactivateWorkspace = createAction(
  '[Workspace] workspace/reactivateWorkspace', 
  props<{ workspaceId: string }>()
);

