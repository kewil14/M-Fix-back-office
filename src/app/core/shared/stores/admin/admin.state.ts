import { DataStateEnum } from "src/app/core/config/data.state.enum";
import { EmployeeResponseDto } from "../../dtos/employee-response-dto";

export interface AdminState {
    dataState: DataStateEnum;
    admins: EmployeeResponseDto[];
    admin: EmployeeResponseDto | null;
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    messages: string;
}

export const initialAdminState: AdminState = {
    dataState: DataStateEnum.INITIAL,
    admins: [],
    admin: null,
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,
    messages: ''
};

