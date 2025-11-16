import { DataStateEnum } from "src/app/core/config/data.state.enum";
import { EmployeeResponseDto } from "../../dtos/employee-response-dto";

export interface EmployeeState {
    dataState: DataStateEnum;
    employees: EmployeeResponseDto[];
    employee: EmployeeResponseDto | null;
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    messages: string;
}

export const initialEmployeeState: EmployeeState = {
    dataState: DataStateEnum.INITIAL,
    employees: [],
    employee: null,
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,
    messages: ''
};

