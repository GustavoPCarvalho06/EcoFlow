// src/context/UnreadCountContext.jsx (VERSÃO FINAL COM CORREÇÃO DE REATIVIDADE)

"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import io from 'socket.io-client';
import { useApiUrl } from './ApiContext';

const UnreadCountContext = createContext();

export function UnreadCountProvider({ children, user }) {
  const apiUrl = useApiUrl();
  const meuUserId = user?.id;

  const [totalMsgUnread, setTotalMsgUnread] = useState(0);
  const [totalComunicadoUnread, setTotalComunicadoUnread] = useState(0);

  // As funções de busca continuam as mesmas, com useCallback para otimização.
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
    } catch (error) {
      console.error("Erro ao buscar contagem de mensagens:", error);
    }
  }, [meuUserId, apiUrl]);

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
    } catch (error) {
      console.error("Erro ao buscar contagem de comunicados:", error);
    }
  }, [meuUserId, apiUrl]);

  const clearComunicadoCount = () => {
    setTotalComunicadoUnread(0);
  };

  // --- INÍCIO DA CORREÇÃO DE REATIVIDADE ---

  // 1. Criamos "refs" para guardar as versões mais recentes das nossas funções de callback.
  const fetchMsgRef = useRef(fetchTotalMsgUnread);
  const fetchComunicadoRef = useRef(fetchTotalComunicadoUnread);

  // 2. Usamos um useEffect simples para garantir que os refs SEMPRE tenham a versão
  //    mais atualizada das funções a cada renderização.
  useEffect(() => {
    fetchMsgRef.current = fetchTotalMsgUnread;
    fetchComunicadoRef.current = fetchTotalComunicadoUnread;
  }); // Sem array de dependências, roda a cada render.

  // 3. O useEffect do socket agora só depende do usuário e da URL.
  //    Ele não precisa mais saber sobre as funções de fetch, evitando o "stale closure".
  useEffect(() => {
    if (meuUserId && apiUrl) {
      // Busca inicial continua a mesma
      fetchTotalMsgUnread();
      fetchTotalComunicadoUnread();

      const socket = io(apiUrl);
      socket.on('connect', () => socket.emit('join', meuUserId));

      // 4. Os listeners agora chamam as funções através dos refs,
      //    garantindo que estão sempre executando a versão mais recente.
      const handleNewMessage = () => fetchMsgRef.current();
      const handleComunicados = () => fetchComunicadoRef.current();

      socket.on('new_message', handleNewMessage);
      socket.on('comunicados_atualizados', handleComunicados);

      return () => {
        socket.off('new_message', handleNewMessage);
        socket.off('comunicados_atualizados', handleComunicados);
        socket.disconnect();
      };
    }
  }, [meuUserId, apiUrl, fetchTotalMsgUnread, fetchTotalComunicadoUnread]); // Mantemos as dependências originais aqui para robustez

  // --- FIM DA CORREÇÃO ---

  const value = { 
    totalMsgUnread, 
    totalComunicadoUnread, 
    fetchTotalUnreadCount: fetchTotalMsgUnread,
    clearComunicadoCount,
  };

  return (
    <UnreadCountContext.Provider value={value}>
      {children}
    </UnreadCountContext.Provider>
  );
}

export const useUnreadCount = () => {
  return useContext(UnreadCountContext);
};