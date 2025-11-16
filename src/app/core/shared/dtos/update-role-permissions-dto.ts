export interface PermissionUpdate {
  id: string;
  constraints?: string;
}

export interface UpdateRolePermissionsDto {
  addPermissions?: PermissionUpdate[];
  removePermissions?: string[];
  updateConstraints?: PermissionUpdate[];
}

