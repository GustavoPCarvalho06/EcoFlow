import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getApiUrl = () => {
  // Tenta pegar o endereço de onde o Expo está rodando
  const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;

  if (debuggerHost) {
    // Separa o IP da porta (ex: "127.0.0.1:8081" vira ip="127.0.0.1")
    const ip = debuggerHost.split(':')[0];

    // LÓGICA DE CORREÇÃO:
    // Se o Expo disser que é "localhost" ou "127.0.0.1"
    if (ip === 'localhost' || ip === '127.0.0.1') {
      
      // Se for Android (Emulador), o IP do computador é SEMPRE 10.0.2.2
      if (Platform.OS === 'android') {
        console.log('[API] Emulador Android detectado. Trocando para 10.0.2.2');
        return 'http://10.0.2.2:3001';
      }
      
      // Se for iOS (Simulador), localhost funciona normal
      return 'http://localhost:3001';
    }

    // Se o Expo já pegou o IP real da rede (ex: 192.168.0.15), usa ele
    return `http://${ip}:3001`;
  }

  // Fallback de segurança (caso não detecte nada, assume emulador Android)
  return 'http://10.0.2.2:3001';
};

const API_URL = getApiUrl();

console.log('🔗 API configurada para:', API_URL);

export default API_URL;