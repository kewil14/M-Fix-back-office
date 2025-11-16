import { PermissionDto } from './permission-dto';

export interface AvailableRoleDto {
  id: string;
  name: string;
  code: string;
  description?: string;
  priority: number;
  isSystemRole: boolean;
  workspaceId?: string;
  scope?: string;
  usersCount: number;
  permissions: PermissionDto[];
  createdAt?: string;
}

export interface RolesContextDto {
  workspaceId?: string;
  shopId?: string;
  userType?: string;
  maxPriority?: number;
}

export interface AvailableRolesResponseDto {
  roles: AvailableRoleDto[];
  context: RolesContextDto;
  totalRoles: number;
}

