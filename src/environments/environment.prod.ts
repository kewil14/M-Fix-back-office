let ipAdress = '217.77.8.234'


export const environment = {
  production: true,

  baseUrlBackend: `http://${ipAdress}:8070/api`,


  
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
