"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import { useApiUrl } from './ApiContext';

const UnreadCountContext = createContext();

export function UnreadCountProvider({ children, user, token }) {
  const apiUrl = useApiUrl();
  const meuUserId = user?.id;

  const [totalMsgUnread, setTotalMsgUnread] = useState(0);
  const [totalComunicadoUnread, setTotalComunicadoUnread] = useState(0);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Busca mensagens não lidas
  const fetchTotalMsgUnread = useCallback(async () => {
    if (!meuUserId || !apiUrl || !token) return;
    try {
      const response = await fetch(`${apiUrl}/msg/unread-counts`, {
        headers: { 'x-user-id': meuUserId.toString(), 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) return;
      const countsBySender = await response.json();
      const total = Object.values(countsBySender).reduce((sum, current) => sum + current, 0);
      setTotalMsgUnread(total);
    } catch (error) { console.error(error); }
  }, [meuUserId, apiUrl, token]);

  // Busca comunicados não lidos
  const fetchTotalComunicadoUnread = useCallback(async () => {
    if (!meuUserId || !apiUrl || !token) return;
    try {
      const response = await fetch(`${apiUrl}/comunicados/unseen-count`, {
        headers: { 'x-user-id': meuUserId.toString(), 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTotalComunicadoUnread(data.count);
      }
    } catch (error) { console.error(error); }
  }, [meuUserId, apiUrl, token]);

  const clearComunicadoCount = () => setTotalComunicadoUnread(0);

  // --- LÓGICA DE CONEXÃO ROBUSTA ---
  useEffect(() => {
    if (!meuUserId || !apiUrl) return;

    // Conecta apenas se não existir socket ou se estiver desconectado
    const newSocket = io(apiUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 3000,
    });

    setSocket(newSocket);

    const handleConnect = () => {
      console.log("🟢 Socket conectado! ID:", newSocket.id);
      setIsConnected(true);
      newSocket.emit('join', meuUserId); // Entra na sala pessoal
      
      // Atualiza contadores ao conectar
      fetchTotalMsgUnread();
      fetchTotalComunicadoUnread();
    };

    const handleDisconnect = () => {
      console.warn("🔴 Socket desconectado.");
      setIsConnected(false);
    };

    newSocket.on('connect', handleConnect);
    newSocket.on('disconnect', handleDisconnect);

    // Listeners globais de atualização
    newSocket.on('new_message', (mensagem) => {
      if (mensagem.destinatario_id === meuUserId) {
        fetchTotalMsgUnread();
      }
    });

    newSocket.on('comunicados_atualizados', () => {
      fetchTotalComunicadoUnread();
    });

    return () => {
      // IMPORTANTE: Só desconecta se o componente desmontar (ex: logout)
      // Não desconecta em navegação simples dentro do layout
      console.log("🧹 Limpando conexão socket...");
      newSocket.disconnect();
    };
  }, [meuUserId, apiUrl]); // Dependências mínimas para evitar re-conexão

  return (
    <UnreadCountContext.Provider value={{ 
      socket, 
      isConnected, 
      totalMsgUnread, 
      totalComunicadoUnread, 
      fetchTotalMsgUnread, 
      clearComunicadoCount 
    }}>
      {children}
    </UnreadCountContext.Provider>
  );
}

export const useUnreadCount = () => {
  const context = useContext(UnreadCountContext);
  if (!context) throw new Error('useUnreadCount deve ser usado dentro de UnreadCountProvider');
  return context;
};