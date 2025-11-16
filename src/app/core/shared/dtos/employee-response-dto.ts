import { RoleResponseDto } from './role-response-dto';

export interface EmployeeResponseDto {
  id: string;
  email: string;
  username: string;
  phoneNumber?: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  birthDate?: string;
  type: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  preferredLanguage?: string;
  timezone?: string;
  workspaceId?: string;
  shopId?: string;
  roles?: RoleResponseDto[];
}

export interface EmployeeListResponseDto {
  totalElements: number;
  totalPages: number;
  size: number;
  content: EmployeeResponseDto[];
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

