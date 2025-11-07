// app/context/UnreadCountContext.jsx
"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import { useApiUrl } from './ApiContext';

const UnreadCountContext = createContext();

export function UnreadCountProvider({ children, user }) {
  const apiUrl = useApiUrl();
  const meuUserId = user?.id;

  const [totalMsgUnread, setTotalMsgUnread] = useState(0);
  const [totalComunicadoUnread, setTotalComunicadoUnread] = useState(0);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Função para buscar contagem de mensagens
  const fetchTotalMsgUnread = useCallback(async () => {
    if (!meuUserId || !apiUrl) {
      setTotalMsgUnread(0);
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/msg/unread-counts`, {
        headers: { 'x-user-id': meuUserId.toString() }
      });
      if (!response.ok) throw new Error("Falha na busca de mensagens");
      const countsBySender = await response.json();
      const total = Object.values(countsBySender).reduce((sum, current) => sum + current, 0);
      setTotalMsgUnread(total);
      console.log('📊 Contagem de mensagens atualizada:', total);
    } catch (error) {
      console.error("Erro ao buscar contagem de mensagens:", error);
    }
  }, [meuUserId, apiUrl]);

  // Função para buscar contagem de comunicados
  const fetchTotalComunicadoUnread = useCallback(async () => {
    if (!meuUserId || !apiUrl) {
      setTotalComunicadoUnread(0);
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/comunicados/unseen-count`, {
        headers: { 'x-user-id': meuUserId.toString() }
      });
      if (!response.ok) throw new Error("Falha na busca de comunicados");
      const data = await response.json();
      setTotalComunicadoUnread(data.count);
      console.log('📢 Contagem de comunicados atualizada:', data.count);
    } catch (error) {
      console.error("Erro ao buscar contagem de comunicados:", error);
    }
  }, [meuUserId, apiUrl]);

  const clearComunicadoCount = () => {
    setTotalComunicadoUnread(0);
  };

  // Efeito principal para gerenciar o socket
  useEffect(() => {
    if (!meuUserId || !apiUrl) return;

    console.log('🔌 Iniciando conexão socket para usuário:', meuUserId);
    
    // Cria nova instância do socket
    const newSocket = io(apiUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    setSocket(newSocket);

    // Configura listeners do socket
    newSocket.on('connect', () => {
      console.log('✅ Socket conectado, fazendo join:', meuUserId);
      setIsConnected(true);
      newSocket.emit('join', meuUserId);
      
      // Busca contagens iniciais após conectar
      fetchTotalMsgUnread();
      fetchTotalComunicadoUnread();
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket desconectado');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Erro de conexão socket:', error);
      setIsConnected(false);
    });

    // Listener para novas mensagens - ATUALIZA EM TEMPO REAL
    newSocket.on('new_message', (mensagem) => {
      console.log('📨 Nova mensagem recebida via socket:', mensagem);
      
      // Se a mensagem é para mim, atualiza a contagem
      if (mensagem.destinatario_id === meuUserId) {
        fetchTotalMsgUnread(); // Atualiza contagem automaticamente
      }
    });

    // Listener para comunicados - ATUALIZA EM TEMPO REAL
    newSocket.on('comunicados_atualizados', () => {
      console.log('📢 Comunicados atualizados via socket');
      fetchTotalComunicadoUnread(); // Atualiza contagem automaticamente
    });

    // Cleanup
    return () => {
      console.log('🧹 Limpando conexão socket');
      newSocket.off('connect');
      newSocket.off('disconnect');
      newSocket.off('connect_error');
      newSocket.off('new_message');
      newSocket.off('comunicados_atualizados');
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
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