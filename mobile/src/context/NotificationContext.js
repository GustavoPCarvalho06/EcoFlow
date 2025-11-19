import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';

// ⚠️ SEU IP AQUI
const API_URL = 'http://10.84.6.136:3001';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [comunicadoCount, setComunicadoCount] = useState(0);
  const [msgCount, setMsgCount] = useState(0); // Total de mensagens não lidas
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);

  // 1. Carrega usuário
  useEffect(() => {
    const loadUser = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('userData');
        const userData = jsonValue != null ? JSON.parse(jsonValue) : null;
        setUser(userData);
      } catch (e) {
        console.error("Erro ao carregar usuário", e);
      }
    };
    loadUser();
  }, []);

  // 2. Conecta Socket e Monitora
  useEffect(() => {
    if (user) {
      const newSocket = io(API_URL);
      setSocket(newSocket);

      // Entra na sala com o ID do usuário para receber mensagens privadas
      newSocket.emit('join', user.id);

      // Ouve atualizações de comunicados
      newSocket.on('comunicados_atualizados', () => fetchCounts());

      // Ouve novas mensagens para atualizar o badge global
      newSocket.on('new_message', (msg) => {
        if (msg.destinatario_id === user.id) {
           fetchCounts();
        }
      });

      // Busca inicial
      fetchCounts();

      return () => newSocket.disconnect();
    }
  }, [user]);

  // 3. Busca as contagens no backend
  const fetchCounts = useCallback(async () => {
    if (!user) return;
    try {
      // Comunicados
      const resComunicados = await fetch(`${API_URL}/comunicados/unseen-count`, {
        headers: { 'x-user-id': user.id.toString() }
      });
      const dataComunicados = await resComunicados.json();
      setComunicadoCount(dataComunicados.count);

      // Mensagens (Soma de todas as conversas)
      const resMsg = await fetch(`${API_URL}/msg/unread-counts`, {
        headers: { 'x-user-id': user.id.toString() }
      });
      const dataMsg = await resMsg.json();
      
      // O backend retorna { "id_remetente": 5, "id_outro": 2 }, somamos os valores
      const totalMessages = Object.values(dataMsg).reduce((a, b) => a + b, 0);
      setMsgCount(totalMessages);

    } catch (error) {
      console.error("Erro ao buscar contagens:", error);
    }
  }, [user]);

  return (
    <NotificationContext.Provider value={{ 
        comunicadoCount, 
        msgCount, 
        fetchCounts, 
        user,
        socket // Exportamos o socket para usar no chat
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);