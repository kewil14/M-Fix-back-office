import { createAction, props } from "@ngrx/store";

// actions to manage local data

export const erreursSystemInit = createAction('[System-init] system-init/erreurs', props<{messages?: string}>());
export const setState = createAction('[System-init] system-init/init', props<{res?: boolean}>());
export const initialise = createAction('[System-init] system-init/init', props<{res?: boolean}>());
// export const conf = createAction('[System-init] system-init/conf', props<{default: DefaultCurrencyDto}>());


//check
export const checkStateAction = createAction('[System-init] system-init/checkStateAction');
export const checkConfigurationAction = createAction('[System-init] system-init/checkConfigurationAction');

//action pour activer 
export const activateInit = createAction('[System-init] system-init/activateInit', props<{init: string}>());
// export const activateConf = createAction('[System-init] system-init/activateConf',  props<{default: DefaultCurrencyDto}>());
