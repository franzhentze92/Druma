import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  activeSection: string;
  setActiveSection: (section: string) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <AppContext.Provider value={{
      activeSection,
      setActiveSection,
      sidebarOpen,
      toggleSidebar,
    }}>
      {children}
    </AppContext.Provider>
  );
};