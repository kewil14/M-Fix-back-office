import { createAction, props } from "@ngrx/store";
import { AdminListRequestDto } from "../../dtos/admin-list-request-dto";
import { EmployeeResponseDto } from "../../dtos/employee-response-dto";
import { CreateAdminDto } from "../../dtos/create-admin-dto.modal";
import { UpdateAdminDto } from "../../dtos/update-admin-dto";

// Actions pour les erreurs
export const erreurAdmins = createAction(
  '[Admin] admin/erreurAdmins', 
  props<{messages: string}>()
);

// Actions pour la gestion locale
export const setAdmin = createAction(
  '[Admin] admin/setAdmin', 
  props<{ admin: EmployeeResponseDto}>()
);

export const addAdmin = createAction(
  '[Admin] admin/addAdmin', 
  props<{ admin: EmployeeResponseDto}>()
);

export const loadAdmins = createAction(
  '[Admin] admin/loadAdmins', 
  props<{ 
    admins: EmployeeResponseDto[];
    totalElements?: number;
    totalPages?: number;
    currentPage?: number;
    pageSize?: number;
  }>()
);

export const removeAdmin = createAction(
  '[Admin] admin/removeAdmin', 
  props<{ adminId: string }>()
);

// Actions pour les opérations distantes
export const findAllAdmins = createAction(
  '[Admin] admin/findAllAdmins', 
  props<{ filters: AdminListRequestDto }>()
);

export const findAdminById = createAction(
  '[Admin] admin/findAdminById', 
  props<{ adminId: string }>()
);

export const createAdminNew = createAction(
  '[Admin] admin/createAdminNew', 
  props<{ createAdminDto: CreateAdminDto }>()
);

export const updateAdmin = createAction(
  '[Admin] admin/updateAdmin', 
  props<{ adminId: string, updateAdminDto: UpdateAdminDto }>()
);

export const deleteAdmin = createAction(
  '[Admin] admin/deleteAdmin', 
  props<{ adminId: string }>()
);

export const reactivateAdmin = createAction(
  '[Admin] admin/reactivateAdmin', 
  props<{ adminId: string }>()
);

