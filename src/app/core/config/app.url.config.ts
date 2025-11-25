import { environment } from '../../../environments/environment.prod';
// const environment = (window as any).__env

const API_BACKEND = environment.baseUrlBackend;
const WORKSPACE_SERVICE_URL = environment.workspaceServiceUrl || 'http://217.77.8.234:8000/workspace-service';
const MEDIA_SERVICE_URL = environment.mediaServiceUrl || 'http://217.77.8.234:8000/media-service';


export const API_URLS = {
  CUSTOMERS_URL: API_BACKEND,
  WORKSPACE_SERVICE_URL: WORKSPACE_SERVICE_URL,
  MEDIA_SERVICE_URL: MEDIA_SERVICE_URL,
};


export const APP_LINK = {
  LINK_AUTH_LOGIN: '/auth',
  LINK_AUTH_RESET_PASSWORD: '/auth/reset-password',
  LINK_AUTH_NEW_PASSWORD: '/auth/new-password',
  LINK_DASHBOARD_ADMIN: '/admin/admin-dashboard',
  LINK_DASHBOARD_USER: '/user',
  LINK_DASHBOARD_WORKSPACE_ADMIN: '/admin/workspace-admin-dashboard',
  LINK_DASHBOARD_SHOP_MANAGER: '/admin/shop-manager-dashboard',
  LINK_DASHBOARD_EMPLOYEE: '/admin/technician-dashboard',
  LINK_DASHBOARD_TECHNICIAN: '/admin/technician-dashboard',
  LINK_DASHBOARD_DELIVERER: '/admin/deliverer-dashboard',
  LINK_LISTE_AUTH_ADMIN: '/auth/sign-up-admin'
}