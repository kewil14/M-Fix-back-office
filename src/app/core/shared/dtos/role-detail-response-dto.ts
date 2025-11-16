import { PermissionDto } from './permission-dto';

export interface RoleDetailResponseDto {
  id: string;
  name: string;
  code: string;
  description?: string;
  workspaceId?: string;
  isSystemRole: boolean;
  priority: number;
  permissions: PermissionDto[];
  createdAt?: string;
  updatedAt?: string;
}

