import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (masterPassword: string) => Promise<void>;
  register: (password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (masterPassword: string) => {
    // Authentication logic here
    await new Promise(resolve => setTimeout(resolve, 400)); // Simulated delay
    setIsAuthenticated(true);
  };

  const register = async (password: string) => {
    // Registration logic here
    await new Promise(resolve => setTimeout(resolve, 400)); // Simulated delay
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}