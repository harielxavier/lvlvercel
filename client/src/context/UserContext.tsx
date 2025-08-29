import { createContext, useContext, type ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface UserContextType {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserContextProvider({ children }: { children: ReactNode }) {
  const authData = useAuth();
  
  return (
    <UserContext.Provider value={authData}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserContextProvider');
  }
  return context;
}
