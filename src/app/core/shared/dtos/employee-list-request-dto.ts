export interface EmployeeListRequestDto {
  workspaceId?: string;
  shopId?: string;
  userType?: string;
  isActive?: boolean;
  search?: string;
  department?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}

