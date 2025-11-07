// Local do arquivo: context/ApiContext.js

"use client"; // Diretiva necessária para que o componente use hooks e rode no navegador.

import { createContext, useContext, useState } from 'react';

// Criamos o contexto. O valor inicial será 'null' até ser definido.
const ApiContext = createContext(null);

/**
 * ApiProvider - Versão Final e Simplificada.
 * 
 * Esta versão abandona os testes de conexão complexos e adota uma estratégia
 * mais direta e confiável: ela constrói a URL da API dinamicamente, usando o
 * mesmo hostname (endereço) que o usuário está acessando a aplicação no navegador.
 * 
 * Isso garante que a comunicação entre frontend e backend nunca seja "cross-host",
 * o que evita problemas de segurança dos navegadores com o armazenamento de cookies.
 */
export function ApiProvider({ children, initialUrl }) {
  
  // Usamos useState com uma função de inicialização.
  // Isso garante que a lógica de detecção de URL rode apenas uma vez,
  // quando o componente é montado pela primeira vez no cliente.
  const [apiUrl] = useState(() => {
    // A condição 'typeof window !== "undefined"' é a forma padrão de
    // verificar se o código está executando no ambiente do navegador.
    if (typeof window !== 'undefined') {
      // Pega o hostname da barra de endereço do navegador (ex: "localhost" ou "10.84.6.136").
      const hostname = window.location.hostname;
      
      // Constrói a URL do backend usando o hostname detectado e a porta correta (3001).
      const backendUrl = `http://${hostname}:3001`;
      
      console.log(`[ApiContext] Ambiente de cliente detectado. URL da API definida para: ${backendUrl}`);
      
      return backendUrl;
    }

    // Este bloco só é executado no servidor (durante a renderização inicial).
    // Ele usa a URL que foi passada pelo layout.js como um valor temporário.
    console.log(`[ApiContext] Ambiente de servidor detectado. Usando URL inicial: ${initialUrl}`);
    return initialUrl;
  });

  // O Provider disponibiliza o valor final de 'apiUrl' para toda a aplicação.
  return <ApiContext.Provider value={apiUrl}>{children}</ApiContext.Provider>;
}

/**
 * useApiUrl - Hook customizado (sem alterações).
 * 
 * Continua sendo a forma simples e centralizada de acessar a URL da API
 * a partir de qualquer componente cliente (como o LoginForm).
 */
export function useApiUrl() {
  return useContext(ApiContext);
}