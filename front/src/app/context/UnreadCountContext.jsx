"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import { useApiUrl } from './ApiContext';

const UnreadCountContext = createContext();

// ADICIONADO: Recebemos 'token' nas props
export function UnreadCountProvider({ children, user, token }) {
  const apiUrl = useApiUrl();
  const meuUserId = user?.id;

  const [totalMsgUnread, setTotalMsgUnread] = useState(0);
  const [totalComunicadoUnread, setTotalComunicadoUnread] = useState(0);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Função para buscar contagem de mensagens
  const fetchTotalMsgUnread = useCallback(async () => {
    // ADICIONADO: Verifica se tem token
    if (!meuUserId || !apiUrl || !token) {
      setTotalMsgUnread(0);
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/msg/unread-counts`, {
        // ADICIONADO: Authorization header
        headers: { 
            'x-user-id': meuUserId.toString(),
            'Authorization': `Bearer ${token}` 
        }
      });
      if (!response.ok) throw new Error("Falha na busca de mensagens");
      const countsBySender = await response.json();
      const total = Object.values(countsBySender).reduce((sum, current) => sum + current, 0);
      setTotalMsgUnread(total);
    } catch (error) {
      console.error("Erro ao buscar contagem de mensagens:", error);
    }
  }, [meuUserId, apiUrl, token]); // ADICIONADO: dependência token

  // Função para buscar contagem de comunicados
  const fetchTotalComunicadoUnread = useCallback(async () => {
    // ADICIONADO: Verifica se tem token
    if (!meuUserId || !apiUrl || !token) {
      setTotalComunicadoUnread(0);
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/comunicados/unseen-count`, {
        // ADICIONADO: Authorization header
        headers: { 
            'x-user-id': meuUserId.toString(),
            'Authorization': `Bearer ${token}` 
        }
      });
      
      // Se a sessão expirou, não joga erro no console, apenas ignora
      if (response.status === 401 || response.status === 403) return;

      if (!response.ok) throw new Error("Falha na busca de comunicados");
      const data = await response.json();
      setTotalComunicadoUnread(data.count);
    } catch (error) {
      console.error("Erro ao buscar contagem de comunicados:", error);
    }
  }, [meuUserId, apiUrl, token]); // ADICIONADO: dependência token

  const clearComunicadoCount = () => {
    setTotalComunicadoUnread(0);
  };

  // Efeito principal para gerenciar o socket
  useEffect(() => {
    if (!meuUserId || !apiUrl) return;

    // Conecta o socket (Socket.io geralmente não precisa do token na conexão inicial se não configurado, 
    // mas as rotas HTTP precisam)
    const newSocket = io(apiUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('join', meuUserId);
      
      // Busca contagens iniciais após conectar
      fetchTotalMsgUnread();
      fetchTotalComunicadoUnread();
    });

    newSocket.on('disconnect', () => setIsConnected(false));
    
    newSocket.on('new_message', (mensagem) => {
      if (mensagem.destinatario_id === meuUserId) {
        fetchTotalMsgUnread();
      }
    });

    newSocket.on('comunicados_atualizados', () => {
      fetchTotalComunicadoUnread();
    });

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [meuUserId, apiUrl, fetchTotalMsgUnread, fetchTotalComunicadoUnread]);

  const value = { 
    socket,
    isConnected,
    totalMsgUnread, 
    totalComunicadoUnread, 
    fetchTotalMsgUnread,
    clearComunicadoCount,
  };

  return (
    <UnreadCountContext.Provider value={value}>
      {children}
    </UnreadCountContext.Provider>
  );
}

export const useUnreadCount = () => {
  const context = useContext(UnreadCountContext);
  if (!context) {
    throw new Error('useUnreadCount deve ser usado dentro de UnreadCountProvider');
  }
  return context;
};