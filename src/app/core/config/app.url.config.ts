import { environment } from '../../../environments/environment.prod';
// const environment = (window as any).__env

const API_BACKEND = environment.baseUrlBackend;


export const API_URLS = {
  CUSTOMERS_URL: API_BACKEND,
};


export const APP_LINK = {
  LINK_AUTH_LOGIN: '/auth',
  LINK_AUTH_RESET_PASSWORD: '/auth/reset-password',
  LINK_AUTH_NEW_PASSWORD: '/auth/new-password',
  LINK_DASHBOARD_ADMIN: '/admin',
  LINK_DASHBOARD_USER: '/user',
  LINK_LISTE_AUTH_ADMIN: '/auth/sign-up-admin'
}