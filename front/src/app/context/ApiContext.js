"use client";

import { createContext, useContext, useState } from 'react';

const ApiContext = createContext(null);

export function ApiProvider({ children, initialUrl }) {
  
  const [apiUrl] = useState(() => {

    if (typeof window !== 'undefined') {
 
      const hostname = window.location.hostname;
      
      const backendUrl = `http://${hostname}:3001`;
      
      
      
      return backendUrl;
    }

    
    return initialUrl;
  });

  return <ApiContext.Provider value={apiUrl}>{children}</ApiContext.Provider>;
}

export function useApiUrl() {
  return useContext(ApiContext);
}