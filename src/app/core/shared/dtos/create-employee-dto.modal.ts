export class CreateEmployeeDto {
    constructor(
        public email?: string,
        public firstName?: string,
        public lastName?: string,
        public userType?: string, // EMPLOYEE, SHOP_MANAGER, TECHNICIAN, DELIVERER
        public workspaceId?: string,
        public shopId?: string,
        public roleIds?: string[],
        // Champs spécifiques pour EMPLOYEE
        public employeeCode?: string,
        public department?: string,
        // Champs spécifiques pour SHOP_MANAGER
        public managerLevel?: string, // JUNIOR, MID, SENIOR
        // Champs spécifiques pour TECHNICIAN
        public specialization?: string,
        public certifications?: string,
        public skillLevel?: number,
        // Champs spécifiques pour DELIVERER
        public vehicleType?: string, // MOTO, CAR, VAN, BIKE
        public licenseNumber?: string,
        public deliveryZones?: string
    ) {}
}

