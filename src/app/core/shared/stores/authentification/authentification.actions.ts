import { createAction, props } from "@ngrx/store";
import { User } from "../../models/users/user.modal";
import { LoginDto } from "../../dtos/login-dto.modal ";
import { ResetPasswordDto } from "../../dtos/reset-password-dto.modal";
import { EmailDto } from "../../dtos/email-dto";

export const erreursAuthentification = createAction('[Authentification] authentification/erreurs', props<{ messages: string }>());
export const messageAuthentification = createAction('[Authentification] authentification/messageAuthentification', props<{message: string}>());
export const connexionOk = createAction('[Authentification] authentification/connexion-ok', props<{typeUser?: User}>());
export const activateAccountOk = createAction('[Authentification] authentification/activate-account-ok');
export const resetPasswordActionOk = createAction('[Authentification] authentification/reset-password-ok', props<{msg: any}>());

// emittion de l'action login d'un utilisateur
export const connexion = createAction('[Authentification] authentification/login', props<{loginDto: LoginDto}>());

//reset password
export const resetPasswordAction = createAction('[Authentification] authentification/reset-password', props<{ resetPasswordDto: ResetPasswordDto }>());

//send token reset password
export const sendTokenResetPassword = createAction('[Authentification] authentification/sendTokenResetPassword', props<{ emailDto: EmailDto }>());

//action pour activer le compte d'un utilisateur
export const activateAccountPlayer = createAction('[Authentification] authentification/activate-account-player', props<{passwordDto: ResetPasswordDto}>());
