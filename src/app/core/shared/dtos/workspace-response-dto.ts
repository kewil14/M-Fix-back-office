export interface WorkspaceResponseDto {
  id: string;
  name: string;
  slug: string;
  type: string; // REPAIR_SHOP, RETAIL, SERVICE
  subscriptionPlan: string; // FREE, BASIC, PREMIUM
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  adminId?: string;
  adminName?: string;
}

export interface WorkspaceListResponseDto {
  totalElements: number;
  totalPages: number;
  size: number;
  content: WorkspaceResponseDto[];
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  pageable: {
    offset: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    pageNumber: number;
    paged: boolean;
    pageSize: number;
    unpaged: boolean;
  };
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface WorkspaceListRequestDto {
  search?: string;
  type?: string;
  subscriptionPlan?: string;
  isActive?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface CreateWorkspaceDto {
  name: string;
  type: string; // REPAIR_SHOP, RETAIL, SERVICE
  subscriptionPlan: string; // FREE, BASIC, PREMIUM
}

export interface UpdateWorkspaceDto {
  name?: string;
  type?: string;
  subscriptionPlan?: string;
  isActive?: boolean;
}

