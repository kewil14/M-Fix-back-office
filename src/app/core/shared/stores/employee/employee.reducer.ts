import { Action, createReducer, on } from '@ngrx/store';
import { DataStateEnum } from "src/app/core/config/data.state.enum";
import { EmployeeState, initialEmployeeState } from "./employee.state";
import {
  findAllEmployees,
  findEmployeeById,
  createEmployeeNew,
  updateEmployee,
  deleteEmployee,
  reactivateEmployee,
  erreurEmployees,
  setEmployee,
  addEmployee,
  loadEmployees,
  removeEmployee
} from './employee.actions';

const reducer = createReducer(
  initialEmployeeState,

  on(findAllEmployees, (state) => ({
    ...state,
    dataState: DataStateEnum.LOADING
  })),

  on(findEmployeeById, (state) => ({
    ...state,
    dataState: DataStateEnum.LOADING
  })),

  on(createEmployeeNew, (state) => ({
    ...state,
    dataState: DataStateEnum.LOADING
  })),

  on(updateEmployee, (state) => ({
    ...state,
    dataState: DataStateEnum.LOADING
  })),

  on(deleteEmployee, (state) => ({
    ...state,
    dataState: DataStateEnum.LOADING
  })),

  on(reactivateEmployee, (state) => ({
    ...state,
    dataState: DataStateEnum.LOADING
  })),

  on(loadEmployees, (state, { employees, totalElements, totalPages, currentPage, pageSize }) => ({
    ...state,
    employees: employees,
    totalElements: totalElements ?? state.totalElements,
    totalPages: totalPages ?? state.totalPages,
    currentPage: currentPage ?? state.currentPage,
    pageSize: pageSize ?? state.pageSize,
    dataState: DataStateEnum.SUCCESS,
    messages: ''
  })),

  on(setEmployee, (state, { employee }) => ({
    ...state,
    employee: employee,
    dataState: DataStateEnum.SUCCESS,
    messages: ''
  })),

  on(addEmployee, (state, { employee }) => ({
    ...state,
    employees: [...state.employees, employee],
    employee: employee,
    dataState: DataStateEnum.SUCCESS,
    messages: ''
  })),

  on(removeEmployee, (state, { employeeId }) => ({
    ...state,
    employees: state.employees.filter(emp => emp.id !== employeeId),
    dataState: DataStateEnum.SUCCESS,
    messages: ''
  })),

  on(erreurEmployees, (state, { messages }) => ({
    ...state,
    dataState: DataStateEnum.ERROR,
    messages: messages
  }))
);

export function employeeReducer(
  state: EmployeeState | undefined,
  action: Action
): EmployeeState {
  return reducer(state, action);
}

