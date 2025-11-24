// =================================================================================
// Arquivo: mobile/src/context/NotificationContext.js
// =================================================================================

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';

// Importa a configuração de IP dinâmico
import API_URL from '../config/api';

const NotificationContext = createContext();

 export const NotificationProvider = ({ children }) => {
  const [comunicadoCount, setComunicadoCount] = useState(0);
  const [msgCount, setMsgCount] = useState(0); 
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);

  // 1. Carrega usuário e ATUALIZA via GET por ID
  useEffect(() => {
    const loadAndRefreshUser = async () => {
      try {
        // 1. Pega os dados salvos no celular (que tem o token e o ID)
        const jsonValue = await AsyncStorage.getItem('userData');
        const localUserData = jsonValue != null ? JSON.parse(jsonValue) : null;

        if (localUserData && localUserData.id) {
          // Define inicialmente o que temos salvo para não ficar tela branca
          setUser(localUserData);

          // 2. AGORA SIM: Faz o GET no backend para pegar os dados frescos (CPF, CEP, etc.)
          try {
            console.log(`🔄 Buscando dados completos do usuário ID: ${localUserData.id}...`);
            const response = await fetch(`${API_URL}/user/get_id/${localUserData.id}`);
            
            if (response.ok) {
              const freshData = await response.json();
              
              // 3. Mescla os dados novos do banco com o token que já tinhamos
              // (O banco não retorna o token na rota get_id, então precisamos manter o antigo)
              const mergedUser = { ...freshData, token: localUserData.token };

              console.log("✅ Dados do usuário atualizados via GET por ID!");
              
              // Atualiza Estado e AsyncStorage
              setUser(mergedUser);
              await AsyncStorage.setItem('userData', JSON.stringify(mergedUser));
            } else {
              console.warn("⚠️ Não foi possível atualizar dados do usuário no backend.");
            }
          } catch (fetchError) {
            console.error("❌ Erro de conexão ao buscar perfil completo:", fetchError);
          }
        }
      } catch (e) {
        console.error("Erro ao carregar usuário do storage", e);
      }
    };

    loadAndRefreshUser();
  }, []);

  // 2. Conecta Socket e Monitora
  useEffect(() => {
    if (user) {
      // Evita reconectar se o socket já estiver conectado com o mesmo ID
      if (socket && socket.connected) return;

      const newSocket = io(API_URL);
      setSocket(newSocket);

      newSocket.emit('join', user.id);

      newSocket.on('comunicados_atualizados', () => fetchCounts());

      newSocket.on('new_message', (msg) => {
        if (msg.destinatario_id === user.id) {
           fetchCounts();
        }
      });

      fetchCounts();

      return () => newSocket.disconnect();
    }
  }, [user]);

  // 3. Busca as contagens no backend
  const fetchCounts = useCallback(async () => {
    if (!user) return;
    try {
      const resComunicados = await fetch(`${API_URL}/comunicados/unseen-count`, {
        headers: { 'x-user-id': user.id.toString() }
      });
      const dataComunicados = await resComunicados.json();
      setComunicadoCount(dataComunicados.count);

      const resMsg = await fetch(`${API_URL}/msg/unread-counts`, {
        headers: { 'x-user-id': user.id.toString() }
      });
      const dataMsg = await resMsg.json();
      
      const totalMessages = Object.values(dataMsg).reduce((a, b) => a + b, 0);
      setMsgCount(totalMessages);

    } catch (error) {
      console.error("Erro ao buscar contagens:", error);
    }
  }, [user]);

  // 4. Função para atualizar o usuário localmente (usada pelo ProfileScreen após editar)
  const updateUserLocal = async (newUserData) => {
    try {
      const updatedUser = { ...user, ...newUserData };
      setUser(updatedUser);
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      console.log("Usuário atualizado localmente com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar usuário local:", error);
    }
  };

  // 5. Função de Logout
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userData');
      setUser(null);
      if (socket) socket.disconnect();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <NotificationContext.Provider value={{ 
        comunicadoCount, 
        msgCount, 
        fetchCounts, 
        user,
        socket,
        updateUserLocal,
        logout
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);