export interface UpdateWorkspaceAdminDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  avatar?: string;
  birthDate?: string;
  preferredLanguage?: string;
  timezone?: string;
  roleIds?: string[];
  workspaceId?: string;
  shopId?: string;
}

