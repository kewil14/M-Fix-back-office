import { DataStateEnum } from "src/app/core/config/data.state.enum";
import { WorkspaceResponseDto } from "../../dtos/workspace-response-dto";

export interface WorkspaceState {
    dataState: DataStateEnum;
    workspaces: WorkspaceResponseDto[];
    workspace: WorkspaceResponseDto | null;
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    messages: string;
}

export const initialWorkspaceState: WorkspaceState = {
    dataState: DataStateEnum.INITIAL,
    workspaces: [],
    workspace: null,
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,
    messages: ''
};

