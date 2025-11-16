import { createAction, props } from "@ngrx/store";
import { RoleResponseDto } from "../../dtos/role-response-dto";
import { AutorisationResponseDto } from "../../dtos/autorisation-response-dto";
import { GroupItemsFinDto } from "../../dtos/group-items-fin-dto.modal";
import { AssignRoleRequestDto } from "../../dtos/assign-role-request-dto";
import { UpdateRolePermissionsDto } from "../../dtos/update-role-permissions-dto";
import { CreateRoleRequestDto } from "../../dtos/create-role-request-dto";

//actions for manage local data
export const erreurRoles = createAction('[RoleResponseDto] authentification/role/erreurs', props<{messages: string}>());

export const setRole = createAction('[RoleResponseDto] authentification/role/setRole', props<{ role: RoleResponseDto}>());
export const deleteRole = createAction('[RoleResponseDto] authentification/role/deleteRole', props<{ role: RoleResponseDto }>());
export const addRole = createAction('[RoleResponseDto] authentification/role/addRole', props<{ role: RoleResponseDto}>());
export const loadRole = createAction('[RoleResponseDto] authentification/role/loadRole', props<{ roles: Array<RoleResponseDto>}>());

export const loadRoleByGroup = createAction('[RoleResponseDto] authentification/role/loadRoleByGroup', props<{ groupRoles: Array<GroupItemsFinDto>}>());

export const setRoleItem = createAction('[RoleResponseDto] authentification/role/setRoleItem', props<{ roleItem: AutorisationResponseDto}>());
export const deleteRoleItem = createAction('[RoleResponseDto] authentification/role/deleteRoleItem', props<{ roleItem: AutorisationResponseDto }>());
export const addRoleItem = createAction('[RoleResponseDto] authentification/role/addRoleItem', props<{ roleItem: AutorisationResponseDto}>());
export const loadRoleItem = createAction('[RoleResponseDto] authentification/role/loadRoleItem', props<{ roleItems: Array<AutorisationResponseDto>}>());

//actions for manage remote data

// tous les roles item de l appli
export const findAllRoleItem = createAction('[RoleResponseDto] authentification/role/findAllRoleItem');

// all role item of saas-instance
export const findAllRoleItemSaas = createAction('[RoleResponseDto] authentification/role/findAllRoleItemSaas');

//tous les roles item par type
export const findAllRoleItemByType = createAction('[RoleResponseDto] authentification/role/findAllRoleItemByType', props<{typeRole: any}>());

//tous les roles d'un user
export const findRoleByUser = createAction('[RoleResponseDto] authentification/role/findRoleByUser', props<{idUser: any}>());

//mettre a jour le role item
export const updateRoleItem = createAction('[RoleResponseDto] authentification/role/updateRoleItem', props<{item: AutorisationResponseDto}>());

//tous les role de l'appli
export const findAvailableRoles = createAction('[RoleResponseDto] authentification/role/findAvailableRoles', props<{workspaceId?: string, shopId?: string}>());
export const findAllRolesSaasAdmin = createAction('[RoleResponseDto] authentification/role/findAllRolesSaasAdmin');
//tous les role de l'appli par id ref
export const findRoleByIdRef = createAction('[RoleResponseDto] authentification/role/findRoleByIdRef', props<{idRef: any}>());

//tous les roles par type
export const findRoleByType = createAction('[RoleResponseDto] authentification/role/findRoleByType', props<{typeRole: any}>());

//tous les roles par id
export const findRoleById = createAction('[RoleResponseDto] authentification/role/idRole', props<{idRole: any}>());

//creation role admin dans le systeme
export const createRoleAdmin = createAction('[RoleResponseDto] authentification/role/createRoleAdmin', props<{role: RoleResponseDto}>());
export const createRoleSaasAdmin = createAction('[RoleResponseDto] authentification/role/createRoleAdmin', props<{role: RoleResponseDto}>());

//mettre a jour un role dans le systeme
export const updateRole = createAction('[RoleResponseDto] authentification/role/updateRole', props<{role: RoleResponseDto}>());

export const getRoleItemByGroup = createAction('[RoleResponseDto] authentification/role/getRoleItemByGroup');

// Nouvelles actions pour les nouveaux endpoints
export const getAvailablePermissions = createAction('[RoleResponseDto] authentification/role/getAvailablePermissions');
export const assignRoleToUser = createAction('[RoleResponseDto] authentification/role/assignRoleToUser', props<{assignRequest: AssignRoleRequestDto}>());
export const revokeRoleFromUser = createAction('[RoleResponseDto] authentification/role/revokeRoleFromUser', props<{targetUserId: string, roleId: string, workspaceId?: string}>());
export const updateRolePermissionsAction = createAction('[RoleResponseDto] authentification/role/updateRolePermissions', props<{roleId: string, permissions: UpdateRolePermissionsDto}>());
export const createRoleNew = createAction('[RoleResponseDto] authentification/role/createRoleNew', props<{role: CreateRoleRequestDto}>());
