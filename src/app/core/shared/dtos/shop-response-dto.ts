export interface ShopResponseDto {
  id: string;
  name: string;
  slug: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  phoneNumber?: string;
  email?: string;
  workspaceId: string;
  workspaceName?: string;
  managerId?: string;
  managerName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ShopListResponseDto {
  totalElements: number;
  totalPages: number;
  size: number;
  content: ShopResponseDto[];
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

export interface ShopListRequestDto {
  workspaceId?: string;
  search?: string;
  isActive?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface CreateShopDto {
  name: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  phoneNumber?: string;
  email?: string;
  workspaceId: string;
  managerId?: string;
}

export interface UpdateShopDto {
  name?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  phoneNumber?: string;
  email?: string;
  managerId?: string;
  isActive?: boolean;
}

