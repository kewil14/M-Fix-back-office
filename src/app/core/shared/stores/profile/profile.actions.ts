import {createAction, props} from '@ngrx/store';
import { User } from '../../models/users/user.modal';

//actions for manage local data
export const erreurProfiles = createAction('[Profile] authentification/profile/erreurs', props<{messages: string}>());
export const userLogin = createAction('[Profile] authentification/profile/userLogin', props<{isLogin: boolean}>());

export const setUserProfile = createAction('[Profile] authentification/profile/setUserProfile', props<{ user?: User }>());


// export const checkProfile = createAction('[Profile] authentification/profile/checkProfile', props<{data: string}>());
export const checkProfile = createAction('[Profile] authentification/profile/checkProfile', props<{userCode?: string}>());
