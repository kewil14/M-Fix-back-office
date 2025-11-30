// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

const ipAdress = '217.77.8.234';

export const environment = {
  production: false,
  baseUrlBackend: `http://${ipAdress}:8000/auth-service/api`,
  workspaceServiceUrl: `http://${ipAdress}:8000/workspace-service`,
  mediaServiceUrl: `http://${ipAdress}:8000/media-service`,
  // Base URL du Product Service (inclut déjà /api/v1)
  productServiceUrl: `http://${ipAdress}:8088/product-service/api/v1`,
  defaultauth: 'fackbackend',
  firebaseConfig: {
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: ''
  }
};



/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
