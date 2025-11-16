import { createAction, props } from "@ngrx/store";
import { WorkspaceAdminListRequestDto } from "../../dtos/workspace-admin-list-request-dto";
import { EmployeeResponseDto } from "../../dtos/employee-response-dto";
import { UpdateWorkspaceAdminDto } from "../../dtos/update-workspace-admin-dto";

export const erreurWorkspaceAdmins = createAction(
  '[WorkspaceAdmin] workspace-admin/erreurWorkspaceAdmins', 
  props<{messages: string}>()
);

export const setWorkspaceAdmin = createAction(
  '[WorkspaceAdmin] workspace-admin/setWorkspaceAdmin', 
  props<{ workspaceAdmin: EmployeeResponseDto}>()
);

export const addWorkspaceAdmin = createAction(
  '[WorkspaceAdmin] workspace-admin/addWorkspaceAdmin', 
  props<{ workspaceAdmin: EmployeeResponseDto}>()
);

export const loadWorkspaceAdmins = createAction(
  '[WorkspaceAdmin] workspace-admin/loadWorkspaceAdmins', 
  props<{ 
    workspaceAdmins: EmployeeResponseDto[];
    totalElements?: number;
    totalPages?: number;
    currentPage?: number;
    pageSize?: number;
  }>()
);

export const removeWorkspaceAdmin = createAction(
  '[WorkspaceAdmin] workspace-admin/removeWorkspaceAdmin', 
  props<{ workspaceAdminId: string }>()
);

export const findAllWorkspaceAdmins = createAction(
  '[WorkspaceAdmin] workspace-admin/findAllWorkspaceAdmins', 
  props<{ filters: WorkspaceAdminListRequestDto }>()
);

export const findWorkspaceAdminById = createAction(
  '[WorkspaceAdmin] workspace-admin/findWorkspaceAdminById', 
  props<{ workspaceAdminId: string }>()
);

export const updateWorkspaceAdmin = createAction(
  '[WorkspaceAdmin] workspace-admin/updateWorkspaceAdmin', 
  props<{ workspaceAdminId: string, updateWorkspaceAdminDto: UpdateWorkspaceAdminDto }>()
);

export const deleteWorkspaceAdmin = createAction(
  '[WorkspaceAdmin] workspace-admin/deleteWorkspaceAdmin', 
  props<{ workspaceAdminId: string }>()
);

export const reactivateWorkspaceAdmin = createAction(
  '[WorkspaceAdmin] workspace-admin/reactivateWorkspaceAdmin', 
  props<{ workspaceAdminId: string }>()
);

