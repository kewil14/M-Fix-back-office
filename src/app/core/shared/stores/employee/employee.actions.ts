import { createAction, props } from "@ngrx/store";
import { EmployeeListRequestDto } from "../../dtos/employee-list-request-dto";
import { EmployeeResponseDto } from "../../dtos/employee-response-dto";
import { CreateEmployeeDto } from "../../dtos/create-employee-dto.modal";
import { UpdateEmployeeDto } from "../../dtos/update-employee-dto";

// Actions pour les erreurs
export const erreurEmployees = createAction(
  '[Employee] employee/erreurEmployees', 
  props<{messages: string}>()
);

// Actions pour la gestion locale
export const setEmployee = createAction(
  '[Employee] employee/setEmployee', 
  props<{ employee: EmployeeResponseDto}>()
);

export const addEmployee = createAction(
  '[Employee] employee/addEmployee', 
  props<{ employee: EmployeeResponseDto}>()
);

export const loadEmployees = createAction(
  '[Employee] employee/loadEmployees', 
  props<{ 
    employees: EmployeeResponseDto[];
    totalElements?: number;
    totalPages?: number;
    currentPage?: number;
    pageSize?: number;
  }>()
);

export const removeEmployee = createAction(
  '[Employee] employee/removeEmployee', 
  props<{ employeeId: string }>()
);

// Actions pour les opérations distantes
export const findAllEmployees = createAction(
  '[Employee] employee/findAllEmployees', 
  props<{ filters: EmployeeListRequestDto }>()
);

export const findEmployeeById = createAction(
  '[Employee] employee/findEmployeeById', 
  props<{ employeeId: string }>()
);

export const createEmployeeNew = createAction(
  '[Employee] employee/createEmployeeNew', 
  props<{ createEmployeeDto: CreateEmployeeDto }>()
);

export const updateEmployee = createAction(
  '[Employee] employee/updateEmployee', 
  props<{ employeeId: string, updateEmployeeDto: UpdateEmployeeDto }>()
);

export const deleteEmployee = createAction(
  '[Employee] employee/deleteEmployee', 
  props<{ employeeId: string }>()
);

export const reactivateEmployee = createAction(
  '[Employee] employee/reactivateEmployee', 
  props<{ employeeId: string }>()
);

