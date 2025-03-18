import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { RegisterUser } from '../../wailsjs/go/main/App';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => Promise<void>;
  register: (email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
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
  // ... other state variables

  const login = async (password: string) => {
    try {
      // Your existing login logic
      setIsAuthenticated(true);
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
        setIsAuthenticated(true);
        return;
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
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      login,
      register,
      logout,
      // ... other properties
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);