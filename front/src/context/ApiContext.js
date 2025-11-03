// Local do arquivo: context/ApiContext.js

"use client"; // <--- ESTA É A LINHA NECESSÁRIA

import { createContext, useContext, useState, useEffect } from 'react';

// URL de fallback final, caso tudo dê errado
const FALLBACK_URL = 'http://localhost:3001';

// 1. Criamos o contexto
const ApiContext = createContext(FALLBACK_URL);

/**
 * ApiProvider é um componente que vai "envolver" sua aplicação.
 * Ele recebe a URL primária detectada no servidor, testa se ela está funcionando
 * no navegador do cliente e, a partir daí, fornece a URL correta (a primária ou a 
 * de fallback) para todos os componentes filhos através do contexto.
 */
export function ApiProvider({ children, initialUrl }) {
  // O estado 'apiUrl' armazena a URL que está ativa no momento (IP ou localhost)
  const [apiUrl, setApiUrl] =  useState(initialUrl || FALLBACK_URL);

  // useEffect é um hook que só pode rodar no lado do cliente (no navegador).
  // Ele é perfeito para fazer o nosso teste de conexão assim que a página carrega.
  useEffect(() => {
    // Só precisamos testar se a URL inicial não for já o localhost
    if (initialUrl && initialUrl !== FALLBACK_URL) {
      console.log(`[API Check] Testando a conexão com a URL primária: ${initialUrl}`);
      
      // Criamos um controller para cancelar o fetch se demorar muito (ex: 2 segundos)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      // Tentamos fazer uma requisição simples para a URL com o IP
      fetch(initialUrl, { signal: controller.signal })
        .then(response => {
          // Se o servidor responder (mesmo que com um erro como 404), ele está acessível.
          if (response.ok || response.status === 404) {
             console.log(`[API Check] Sucesso! Usando a API em: ${initialUrl}`);
             setApiUrl(initialUrl); // Mantém a URL do IP como a ativa
          } else {
            // Se o servidor responder com outro erro, consideramos uma falha
            throw new Error('Servidor respondeu com erro');
          }
        })
        .catch(() => {
          // Se cair no catch, significa que a rede falhou ou o tempo esgotou
          console.warn(`[API Check] AVISO: Falha ao conectar em ${initialUrl}.`);
          console.log(`[API Check] Trocando para a API de fallback: ${FALLBACK_URL}`);
          setApiUrl(FALLBACK_URL); // Muda para o localhost
        })
        .finally(() => {
            clearTimeout(timeoutId); // Limpa o timeout para evitar vazamento de memória
        });
    }
  }, [initialUrl]); // Executa este efeito apenas uma vez quando a página carrega

  // O Provider disponibiliza o valor de 'apiUrl' para qualquer componente que o peça.
  return <ApiContext.Provider value={apiUrl}>{children}</ApiContext.Provider>;
}

/**
 * useApiUrl é um "hook" customizado que facilita o acesso à URL da API.
 * Em vez de importar useContext e ApiContext em todo componente,
 * agora só precisamos importar e chamar useApiUrl().
 */
export function useApiUrl() {
  return useContext(ApiContext);
}