export interface UpdateEmployeeDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  avatar?: string;
  birthDate?: string;
  preferredLanguage?: string;
  timezone?: string;
  shopId?: string;
  roleIds?: string[];
  employeeCode?: string;
  department?: string;
  managerLevel?: string;
  specialization?: string;
  certifications?: string;
  skillLevel?: number;
  vehicleType?: string;
  licenseNumber?: string;
  deliveryZones?: string;
  isAvailable?: boolean;
}

