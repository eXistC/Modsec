import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { RegisterUser, LoginUser } from '../../wailsjs/go/main/App';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
  sessionToken?: string;
  encryptedVault?: string;
  // ... other properties
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  // ... other properties
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | undefined>(undefined);
  const [encryptedVault, setEncryptedVault] = useState<string | undefined>(undefined);
  // ... other state variables

  const login = async (email: string, password: string) => {
    try {
      // Call the Go function to login the user
      const response = await LoginUser(email, password);
      
      if (response.success) {
        setIsAuthenticated(true);
        setSessionToken(response.sessionToken);
        setEncryptedVault(response.encryptedVault);
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, confirmPassword: string) => {
    try {
      // Check if passwords match
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      // Call the Go function to register the user
      const success = await RegisterUser(email, password);
      
      if (success) {
        // Auto-login after successful registration
        await login(email, password);
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setSessionToken(undefined);
    setEncryptedVault(undefined);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      login,
      register,
      logout,
      sessionToken,
      encryptedVault,
      // ... other properties
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);