// src/context/UnreadCountContext.jsx

"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

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

  // Busca a contagem inicial quando o provedor é montado ou o usuário muda
  useEffect(() => {
    fetchTotalUnreadCount();
  }, [fetchTotalUnreadCount]);

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