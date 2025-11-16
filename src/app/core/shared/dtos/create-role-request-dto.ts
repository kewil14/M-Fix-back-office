export interface CreateRoleRequestDto {
  name: string;
  code: string;
  description?: string;
  workspaceId?: string;
  permissionIds: string[];
  permissionConstraints?: {
    [key: string]: string;
  };
}

