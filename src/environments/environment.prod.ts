let ipAdress = '217.77.8.234'


export const environment = {
  production: true,

  baseUrlBackend: `http://${ipAdress}:8000/auth-service/api`,
  workspaceServiceUrl: `http://${ipAdress}:8000/workspace-service`,
  mediaServiceUrl: `http://${ipAdress}:8000/media-service`,
  // Base URL du Product Service (inclut déjà /api/v1)
  productServiceUrl: `http://${ipAdress}:8088/api/v1`,

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
