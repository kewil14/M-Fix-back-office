export interface ShopResponseDto {
  id: string;
  workspaceId: string;
  code?: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  isActive: boolean;
  isMainShop?: boolean;
  openingHours?: { [key: string]: string };
  createdAt: string;
  updatedAt?: string;
  // Champs pour compatibilité
  phoneNumber?: string;
  workspaceName?: string;
  managerId?: string;
  managerName?: string;
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
  phone?: string;
  email?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  // Champs pour compatibilité
  phoneNumber?: string;
  workspaceId?: string; // Sera passé dans l'URL
  managerId?: string;
}

export interface UpdateShopDto {
  name?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  description?: string;
  openingHours?: { [key: string]: string };
  // Champs pour compatibilité
  phoneNumber?: string;
  managerId?: string;
  isActive?: boolean;
}

