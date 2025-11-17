import { createAction, props } from "@ngrx/store";
import { User } from "../../models/users/user.modal";
import { LoginDto } from "../../dtos/login-dto.modal ";
import { ResetPasswordDto } from "../../dtos/reset-password-dto.modal";
import { EmailDto } from "../../dtos/email-dto";
import { ValidateTokenResponseDto } from "../../dtos/validate-token-response-dto.modal";
import { ActivateAccountDto } from "../../dtos/activate-account-dto.modal";
import { CreateSuperAdminDto } from "../../dtos/create-superadmin-dto.modal";
import { CreateAdminDto } from "../../dtos/create-admin-dto.modal";
import { CreateWorkspaceWithAdminDto } from "../../dtos/create-workspace-admin-dto.modal";
import { CreateEmployeeDto } from "../../dtos/create-employee-dto.modal";
import { ResendInvitationDto } from "../../dtos/resend-invitation-dto.modal";
import { InvitationListRequestDto } from "../../dtos/invitation-list-request-dto.modal";
import { InvitationResponseDto, InvitationListResponseDto } from "../../dtos/invitation-response-dto.modal";

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

//action pour valider un token d'activation
export const validateActivationToken = createAction('[Authentification] authentification/validate-activation-token', props<{token: string}>());
export const validateActivationTokenOk = createAction('[Authentification] authentification/validate-activation-token-ok', props<{tokenData: ValidateTokenResponseDto}>());

//action pour activer un compte avec token
export const activateAccountWithToken = createAction('[Authentification] authentification/activate-account-with-token', props<{activateAccountDto: ActivateAccountDto}>());
export const activateAccountWithTokenOk = createAction('[Authentification] authentification/activate-account-with-token-ok');

//actions pour créer SuperAdmin
export const createSuperAdmin = createAction('[Authentification] authentification/create-superadmin', props<{createSuperAdminDto: CreateSuperAdminDto}>());
export const createSuperAdminOk = createAction('[Authentification] authentification/create-superadmin-ok', props<{user: User}>());

//actions pour créer Admin
export const createAdmin = createAction('[Authentification] authentification/create-admin', props<{createAdminDto: CreateAdminDto}>());
export const createAdminOk = createAction('[Authentification] authentification/create-admin-ok', props<{user: User}>());

//actions pour créer Workspace avec Admin
export const createWorkspaceWithAdmin = createAction('[Authentification] authentification/create-workspace-with-admin', props<{createWorkspaceWithAdminDto: CreateWorkspaceWithAdminDto}>());
export const createWorkspaceWithAdminOk = createAction('[Authentification] authentification/create-workspace-with-admin-ok', props<{data: any}>());

//actions pour créer Employee
export const createEmployee = createAction('[Authentification] authentification/create-employee', props<{createEmployeeDto: CreateEmployeeDto}>());
export const createEmployeeOk = createAction('[Authentification] authentification/create-employee-ok', props<{user: User}>());

//actions pour logout
export const logout = createAction('[Authentification] authentification/logout');
export const logoutOk = createAction('[Authentification] authentification/logout-ok');

//actions pour les invitations
export const resendInvitation = createAction('[Authentification] authentification/resend-invitation', props<{resendInvitationDto: ResendInvitationDto}>());
export const resendInvitationOk = createAction('[Authentification] authentification/resend-invitation-ok', props<{message: string}>());
export const resendInvitationError = createAction('[Authentification] authentification/resend-invitation-error', props<{messages: string}>());

export const getInvitations = createAction('[Authentification] authentification/get-invitations', props<{invitationListRequestDto: InvitationListRequestDto}>());
export const getInvitationsOk = createAction('[Authentification] authentification/get-invitations-ok', props<{invitations: InvitationListResponseDto}>());
export const getInvitationsError = createAction('[Authentification] authentification/get-invitations-error', props<{messages: string}>());

export const getInvitationById = createAction('[Authentification] authentification/get-invitation-by-id', props<{invitationId: string}>());
export const getInvitationByIdOk = createAction('[Authentification] authentification/get-invitation-by-id-ok', props<{invitation: InvitationResponseDto}>());
export const getInvitationByIdError = createAction('[Authentification] authentification/get-invitation-by-id-error', props<{messages: string}>());
