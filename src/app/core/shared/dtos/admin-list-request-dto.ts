export interface AdminListRequestDto {
  isActive?: boolean;
  isSuperAdmin?: boolean;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}

