import { StateAddressEnum } from "../../../config/data.state.enum";
import { RoleResponseDto } from "../../dtos/role-response-dto";


export class User{
    constructor(
        public accountNonExpired?: boolean,
        public accountNonLocked?: boolean,
        public authorities?: [],
        public credentialsNonExpired?: boolean,
        public enabled?: boolean,
        public image?: string,
        public isActive?: boolean,
        public password?: string,
        public preferredCurrency?: string,
        public roles?: RoleResponseDto[],
        public token?: string,
        public userCode?: string,
        public userEmail?: string,
        public userNames?: string, 
        public firstname?: string, 
        public lastname?: string, 
        public userPassword?: string,  
        public userPhoneNumber?: string,  
        public username?: string, 
        public userFirstName?: string,       
        public userLastName?: string,       
    ){}
}