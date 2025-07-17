export  class ResetPasswordDto{
    constructor(
        public password?:string,
        public token?:string,
        public mail?:string,
    ){}
}