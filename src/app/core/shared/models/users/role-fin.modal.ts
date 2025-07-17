
import { RoleEnum } from "src/app/core/config/data.state.enum";

export class RoleFin{                                                                                               
    constructor(
        public authorisationsCode?:Array<string>,
        public roleCode?: string,
        public roleDescription?: string,
        public roleName?: string,
        public state?: RoleEnum  
    ){}
}
