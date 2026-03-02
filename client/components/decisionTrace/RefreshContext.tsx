import React, { createContext, useContext, useState, useCallback } from 'react';

interface RefreshContextType {
  refreshTrigger: number;
  refreshEventDetails: () => void;
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

export const RefreshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshEventDetails = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <RefreshContext.Provider value={{ refreshTrigger, refreshEventDetails }}>
      {children}
    </RefreshContext.Provider>
  );
};

export const useRefresh = () => {
  const context = useContext(RefreshContext);
  if (context === undefined) {
    throw new Error('useRefresh must be used within a RefreshProvider');
  }
  return context;
};