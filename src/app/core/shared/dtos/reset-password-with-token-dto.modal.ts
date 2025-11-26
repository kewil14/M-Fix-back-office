export class ResetPasswordWithTokenDto {
  constructor(
    public token: string,
    public otp: string,
    public newPassword: string
  ) {}
}


