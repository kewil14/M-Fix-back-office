export interface WorkspaceAdminListRequestDto {
  workspaceId?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}

