// src/context/UnreadCountContext.jsx (VERSÃO FINAL COM ATUALIZAÇÃO EM TEMPO REAL)

"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
// [NOVO] Importamos a biblioteca do socket.io-client
import io from 'socket.io-client';

// 1. Criamos o Contexto
const UnreadCountContext = createContext();

// 2. Criamos um "Provedor" que vai gerenciar o estado
export function UnreadCountProvider({ children, user }) {
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const meuUserId = user?.id;

  // Criamos uma função para buscar a contagem, que será reutilizável
  const fetchTotalUnreadCount = useCallback(async () => {
    if (!meuUserId) {
      setTotalUnreadCount(0);
      return;
    }
    try {
      const response = await fetch('http://localhost:3001/msg/unread-counts', {
        headers: { 'x-user-id': meuUserId.toString() }
      });
      if (!response.ok) throw new Error("Falha na busca");
      const countsBySender = await response.json();
      const total = Object.values(countsBySender).reduce((sum, current) => sum + current, 0);
      setTotalUnreadCount(total);
    } catch (error) {
      console.error("Erro ao buscar contagem total no contexto:", error);
      setTotalUnreadCount(0);
    }
  }, [meuUserId]);

  // [MODIFICADO] Este efeito agora gerencia tanto a busca inicial quanto a conexão do socket
  useEffect(() => {
    // 1. Busca a contagem inicial ao carregar
    fetchTotalUnreadCount();

    // 2. Se houver um usuário logado, estabelece a conexão em tempo real
    if (meuUserId) {
      const socket = io('http://localhost:3001');

      // Identifica o usuário no servidor de socket
      socket.on('connect', () => {
        socket.emit('join', meuUserId);
      });

      // Define o que fazer quando uma nova mensagem chegar
      const handleNewMessage = (novaMensagem) => {
        // Se a mensagem for destinada a mim (e não enviada por mim para mim mesmo),
        // atualiza a contagem total.
        if (novaMensagem.destinatario_id === meuUserId) {
          fetchTotalUnreadCount();
        }
      };
      
      // "Ouve" pelo evento 'new_message'
      socket.on('new_message', handleNewMessage);

      // 3. Função de limpeza: É crucial para evitar bugs ao deslogar/trocar de página
      return () => {
        socket.off('new_message', handleNewMessage); // Remove o listener
        socket.disconnect(); // Desconecta o socket
      };
    }
  }, [meuUserId, fetchTotalUnreadCount]); // O array de dependências garante que a lógica rode novamente se o usuário mudar

  // O valor que será compartilhado com os componentes filhos
  const value = { totalUnreadCount, fetchTotalUnreadCount };

  return (
    <UnreadCountContext.Provider value={value}>
      {children}
    </UnreadCountContext.Provider>
  );
}

// 3. Criamos um Hook customizado para facilitar o uso do contexto
export const useUnreadCount = () => {
  return useContext(UnreadCountContext);
};