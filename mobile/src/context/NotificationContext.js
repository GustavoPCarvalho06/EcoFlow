import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';
import API_URL from '../config/api';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [comunicadoCount, setComunicadoCount] = useState(0);
  const [msgCount, setMsgCount] = useState(0); 
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);

  // 1. Carrega usuário e ATUALIZA dados completos
  useEffect(() => {
    const loadAndRefreshUser = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('userData');
        const localUserData = jsonValue != null ? JSON.parse(jsonValue) : null;

        if (localUserData && localUserData.id) {
          setUser(localUserData);

          // --- CORREÇÃO AQUI: Adicionar Header Authorization ---
          try {
            console.log(`🔄 Buscando dados completos do usuário ID: ${localUserData.id}...`);
            
            const response = await fetch(`${API_URL}/user/get_id/${localUserData.id}`, {
                headers: {
                    // Se o backend pedir 'Authorization': `Bearer ${token}`
                    'Authorization': `Bearer ${localUserData.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
              const freshData = await response.json();
              // Mescla dados novos com o token antigo
              const mergedUser = { ...freshData, token: localUserData.token };
              
              console.log("✅ Dados atualizados via GET por ID!");
              setUser(mergedUser);
              await AsyncStorage.setItem('userData', JSON.stringify(mergedUser));
            } else {
              console.warn("⚠️ Falha ao atualizar perfil. Status:", response.status);
            }
          } catch (fetchError) {
            console.error("❌ Erro de conexão ao buscar perfil:", fetchError);
          }
        }
      } catch (e) {
        console.error("Erro ao carregar do storage", e);
      }
    };

    loadAndRefreshUser();
  }, []);

  // 2. Socket e Counts (Mantido igual, mas adicionando headers nas chamadas tb)
  const fetchCounts = useCallback(async () => {
    if (!user) return;
    try {
      const resComunicados = await fetch(`${API_URL}/comunicados/unseen-count`, {
        headers: { 
            'x-user-id': user.id.toString(),
            // Adicione Auth se suas rotas de comunicados também precisarem
            // 'Authorization': `Bearer ${user.token}` 
        }
      });
      if (resComunicados.ok) {
          const dataComunicados = await resComunicados.json();
          setComunicadoCount(dataComunicados.count);
      }

      const resMsg = await fetch(`${API_URL}/msg/unread-counts`, {
        headers: { 
            'x-user-id': user.id.toString(),
            // 'Authorization': `Bearer ${user.token}`
        }
      });
      if (resMsg.ok) {
          const dataMsg = await resMsg.json();
          const totalMessages = Object.values(dataMsg).reduce((a, b) => a + b, 0);
          setMsgCount(totalMessages);
      }
    } catch (error) {
      console.error("Erro ao buscar contagens:", error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      if (socket && socket.connected) return;
      const newSocket = io(API_URL);
      setSocket(newSocket);
      newSocket.emit('join', user.id);
      newSocket.on('comunicados_atualizados', () => fetchCounts());
      newSocket.on('new_message', (msg) => {
        if (msg.destinatario_id === user.id) fetchCounts();
      });
      fetchCounts();
      return () => newSocket.disconnect();
    }
  }, [user]);

  const updateUserLocal = async (newUserData) => {
    try {
      const updatedUser = { ...user, ...newUserData };
      setUser(updatedUser);
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Erro ao atualizar local:", error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userData');
      setUser(null);
      if (socket) socket.disconnect();
    } catch (error) {
      console.error("Erro logout:", error);
    }
  };

  return (
    <NotificationContext.Provider value={{ comunicadoCount, msgCount, fetchCounts, user, socket, updateUserLocal, logout }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);