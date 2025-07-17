import { RoleState } from "./role.state";
import { setRole, deleteRole, addRole, loadRole, erreurRoles,
    setRoleItem, deleteRoleItem, addRoleItem, loadRoleItem,
    findAllRoleItem, findAllRoleItemByType, findRoleByUser,
    updateRoleItem, findAllRoles, findRoleByIdRef, findRoleByType,
    findRoleById, createRoleAdmin, updateRole, getRoleItemByGroup, loadRoleByGroup, findAllRoleItemSaas,
    findAllRolesSaasAdmin
} from './role.actions';
import { Action, createReducer, on } from '@ngrx/store';
import { DataStateEnum } from "src/app/core/config/data.state.enum";

const initState: RoleState = {
    dataState: DataStateEnum.INITIAL,
    ruleItem: {},
    ruleItems: [],
    rule: {},
    rules: [],
    groupRoles: [],
    messages: '',
}

const reducer = createReducer(initState,

    // on(setRole, (state, {role}) => {
    //   let roles = [...state.roles];
    //   let list: Array<Role> = roles.filter((item) => item.id != role.id);
    //   list.push(role)
    //   return {...state, roles: list, role: role, dataState: DataStateEnum.SUCCESS, messages: ''}
    // }),

    // on(setRoleItem, (state, {roleItem}) => {
    //     let roles = [...state.items];
    //     let list: Array<RoleItem> = roles.filter((item) => item.id != roleItem.id);
    //     list.push(roleItem)
    //     return {...state, items: list, roleItem: roleItem, dataState: DataStateEnum.SUCCESS, messages: ''}
    //   }),

    // on(deleteRole, (state, {role}) => {
    //   let roles = [...state.rules];
    //   let list: Array<RoleFin> = roles.filter((item) => item.roleCode != role.roleCode);
    //   return {...state, rules: list, rule: role, dataState: DataStateEnum.SUCCESS, messages: ''}
    // }),

    // on(deleteRoleItem, (state, {roleItem}) => {
    //     let roles = [...state.items];
    //     let list: Array<RoleItem> = roles.filter((item) => item.id != roleItem.id);
    //     return {...state, items: list, roleItem: roleItem, dataState: DataStateEnum.SUCCESS, messages: ''}
    // }),

    // on(addRole, (state, {role}) => {
    //   let roles = [...state.roles];
    //   roles.push(role);
    //   return {...state, roles: roles, role: role, messages: ''};
    // }),

    // on(addRoleItem, (state, {roleItem}) => {
    //     let roles = [...state.items];
    //     roles.push(roleItem);
    //     return {...state, items: roles, roleItem: roleItem, messages: ''};
    //   }),

    on(loadRole, (state, {roles}) => ({...state, rules: roles, dataState: DataStateEnum.SUCCESS, messages: ''})),
    
    on(loadRoleByGroup, (state, {groupRoles}) => ({...state, groupRoles: groupRoles, dataState: DataStateEnum.SUCCESS, messages: ''})),
    
    on(loadRoleItem, (state, {roleItems}) => ({...state, ruleItems: roleItems, dataState: DataStateEnum.SUCCESS, messages: ''})),
    
    on(erreurRoles, (state, {messages}) => ({...state, dataState: DataStateEnum.ERROR, messages: messages})),

    on( findAllRoleItem, findAllRoleItemByType, findRoleByUser,
    updateRoleItem, findAllRoles, findRoleByIdRef, findRoleByType, getRoleItemByGroup,
    findRoleById, createRoleAdmin, updateRole, findAllRoleItemSaas,
    findAllRolesSaasAdmin, 
    state => ({ ...state, dataState: DataStateEnum.LOADING, messages: '' }))
  );
  
  export function rolesReducer(
    state: RoleState | undefined,
    action: Action
  ): RoleState {
    return reducer(state, action);
  }