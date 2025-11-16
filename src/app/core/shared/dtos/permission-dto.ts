export interface PermissionDto {
  id: string;
  name: string;
  resource: string;
  action: string;
  scope: string;
  description?: string;
  constraints?: string;
}

export interface AvailablePermissionsResponseDto {
  permissions: PermissionDto[];
  groupedBy?: string;
  groupedPermissions?: {
    [key: string]: PermissionDto[];
  };
}

