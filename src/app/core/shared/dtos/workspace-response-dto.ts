export interface WorkspaceSettingsDto {
  id: string;
  workspaceId: string;
  timezone?: string;
  currency?: string;
  language?: string;
  businessHours?: { [key: string]: string };
  taxSettings?: { [key: string]: string };
  allowOnlineOrders?: boolean;
  allowRepairs?: boolean;
  allowDelivery?: boolean;
  updatedAt?: string;
}

export interface WorkspaceSubscriptionDto {
  id: string;
  workspaceId: string;
  planType: string;
  price: number;
  startDate: string;
  endDate: string;
  status: string;
  maxShops?: number;
  maxUsers?: number;
  maxProducts?: number;
  maxOrders?: number;
  features?: { [key: string]: string };
  autoRenew?: boolean;
  updatedAt?: string;
}

export interface WorkspaceResponseDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  industry?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  settings?: WorkspaceSettingsDto;
  subscription?: WorkspaceSubscriptionDto;
  adminId?: string;
  adminName?: string;
  planType?: string; // Pour compatibilité
  shopCount?: number;
  userCount?: number;
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
  description?: string;
  logo?: string;
  domain?: string;
}

