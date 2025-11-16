import { DataStateEnum } from "src/app/core/config/data.state.enum";
import { EmployeeResponseDto } from "../../dtos/employee-response-dto";

export interface WorkspaceAdminState {
    dataState: DataStateEnum;
    workspaceAdmins: EmployeeResponseDto[];
    workspaceAdmin: EmployeeResponseDto | null;
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    messages: string;
}

export const initialWorkspaceAdminState: WorkspaceAdminState = {
    dataState: DataStateEnum.INITIAL,
    workspaceAdmins: [],
    workspaceAdmin: null,
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,
    messages: ''
};

