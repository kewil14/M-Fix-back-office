export class CreateRoleDto {
    constructor(
     
     
       // public state: string="ACTIVE",
        public roleName?: string,

        public roleCode?: string,
        public authorisationsCode?: any[],
        public roleDescription?: string,
       
       
    ){}
}


