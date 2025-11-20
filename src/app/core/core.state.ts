import { ActionReducerMap, createFeatureSelector } from '@ngrx/store';
import { AuthentificationState } from './shared/stores/authentification/authentification.state';
import { AuthentificationReducer } from './shared/stores/authentification/authentification.reducer';
import { ProfileState } from './shared/stores/profile/profile.state';
import { profileReducer } from './shared/stores/profile/profile.reducer';
import { RoleState } from './shared/stores/role/role.state';
import { rolesReducer } from './shared/stores/role/role.reducer';
import { UserState } from './shared/stores/user/user.state';
import { userReducer } from './shared/stores/user/user.reducer';
import { GrilleState } from './shared/stores/grille/grille.state';
import { grilleReducer } from './shared/stores/grille/grille.reducer';
import { AvisState } from './shared/stores/avis/avis.state';
import { avisReducer } from './shared/stores/avis/avis.reducer';
import { DevisState } from './shared/stores/devis/devis.state';
import { devisReducer } from './shared/stores/devis/devis.reducer';
import { DemandeState } from './shared/stores/demande/demande.state';
import { demandeReducer } from './shared/stores/demande/demande.reducer';
import { AddressState } from './shared/stores/address/address.state';
import { adressReducer } from './shared/stores/address/address.reducer';
import { EmployeeState } from './shared/stores/employee/employee.state';
import { employeeReducer } from './shared/stores/employee/employee.reducer';
import { AdminState } from './shared/stores/admin/admin.state';
import { adminReducer } from './shared/stores/admin/admin.reducer';
import { WorkspaceAdminState } from './shared/stores/workspace-admin/workspace-admin.state';
import { WorkspaceAdminReducer } from './shared/stores/workspace-admin/workspace-admin.reducer';
import { WorkspaceState } from './shared/stores/workspace/workspace.state';
import { WorkspaceReducer } from './shared/stores/workspace/workspace.reducer';
import { ShopState } from './shared/stores/shop/shop.state';
import { ShopReducer } from './shared/stores/shop/shop.reducer';

export interface AppState {
    authentificationState: AuthentificationState,
    roleState: RoleState,
    profileState: ProfileState,
    userState: UserState,
    grilleState: GrilleState,
    avisState: AvisState,
    devisState: DevisState,
    demandeState: DemandeState,
    addressState: AddressState,
    employeeState: EmployeeState,
    adminState: AdminState,
    workspaceAdminState: WorkspaceAdminState,
    workspaceState: WorkspaceState,
    shopState: ShopState
}

export const selectauthentificationState = createFeatureSelector<AuthentificationState>('authentificationState');
export const selectProfileState = createFeatureSelector<ProfileState>('profileState');
export const selectRoleState = createFeatureSelector<RoleState>('roleState');
export const selectUserState = createFeatureSelector<UserState>('userState');
export const selectGrilleState = createFeatureSelector<GrilleState>('grilleState');
export const selectAvisState = createFeatureSelector<AvisState>('avisState');
export const selectDevisState = createFeatureSelector<DevisState>('devisState');
export const selectDemandeState = createFeatureSelector<DemandeState>('demandeState');
export const selectAddressState = createFeatureSelector<AddressState>('addressState');
export const selectEmployeeState = createFeatureSelector<EmployeeState>('employeeState');
export const selectAdminState = createFeatureSelector<AdminState>('adminState');
export const selectWorkspaceAdminState = createFeatureSelector<WorkspaceAdminState>('workspaceAdminState');
export const selectWorkspaceState = createFeatureSelector<WorkspaceState>('workspaceState');
export const selectShopState = createFeatureSelector<ShopState>('shopState');


export const reducers: ActionReducerMap<AppState> = {
    authentificationState: AuthentificationReducer,
    roleState: rolesReducer,
    profileState: profileReducer,
    userState: userReducer,
    grilleState: grilleReducer,
    avisState: avisReducer,
    devisState: devisReducer,
    demandeState: demandeReducer,
    addressState: adressReducer,
    employeeState: employeeReducer,
    adminState: adminReducer,
    workspaceAdminState: WorkspaceAdminReducer,
    workspaceState: WorkspaceReducer,
    shopState: ShopReducer
}






