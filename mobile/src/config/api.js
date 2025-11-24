// Arquivo: mobile/src/config/api.js

import Constants from 'expo-constants';

let API_URL = '';

const getLocalIp = () => {
  // Tenta pegar o IP através do manifesto do Expo (funciona no Expo Go)
  const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;

  if (debuggerHost) {
    // O debuggerHost vem no formato "192.168.1.5:8081"
    // Nós pegamos apenas o IP antes dos dois pontos
    const ip = debuggerHost.split(':')[0];
    
    // Retornamos o IP com a porta do seu backend (3001)
    return `http://${ip}:3001`;
  }

  // Fallback: Se não conseguir detectar (ex: Emulador Android usa 10.0.2.2 para localhost)
  return 'http://10.0.2.2:3001'; 
};

API_URL = getLocalIp();

console.log('🔗 API URL configurada para:', API_URL);

export default API_URL;