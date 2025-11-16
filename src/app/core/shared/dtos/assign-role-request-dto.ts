export interface AssignRoleRequestDto {
  targetUserId: string;
  roleId: string;
  workspaceId?: string;
  shopId?: string;
  expiresAt?: string;
}

