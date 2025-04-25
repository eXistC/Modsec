import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { LoginUser, RegisterUser, CheckSession } from '../../wailsjs/go/main/App';

interface AuthContextType {
  isAuthenticated: boolean;
  isRegistrationComplete: boolean;
  seedPhrase: string | null;
  userEmail: string | null; // Added userEmail to the interface
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, confirmPassword: string) => Promise<void>;
  confirmSeedPhrase: () => void;
  logout: () => void;
  checkSession: () => Promise<boolean>; // Added checkSession to the interface
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isRegistrationComplete: false,
  seedPhrase: null,
  userEmail: null, // Added default value
  login: async () => {},
  register: async () => {},
  confirmSeedPhrase: () => {},
  logout: () => {},
  checkSession: async () => false, // Added default implementation
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(true);
  const [seedPhrase, setSeedPhrase] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null); // Added state for userEmail

  const login = async (email: string, password: string) => {
    try {
      const success = await LoginUser(email, password);
      
      if (success) {
        setIsAuthenticated(true);
        setUserEmail(email); // Store email on successful login
        return;
      } else {
        throw new Error('Login failed');
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
      const response = await RegisterUser(email, password);
      
      if (response) {
        // Store the seed phrase returned from the backend
        setSeedPhrase(response);
        // Set registration as incomplete so the seed phrase page shows
        setIsRegistrationComplete(false);
        // Set as authenticated since registration was successful
        setIsAuthenticated(true);
        // Store the user's email
        setUserEmail(email);
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const confirmSeedPhrase = () => {
    setIsRegistrationComplete(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setSeedPhrase(null);
    setUserEmail(null); // Clear email on logout
  };

  const checkSession = useCallback(async () => {
    try {
      const response = await CheckSession();
      
      if (response && response.Success) {
        setIsAuthenticated(true);
        setUserEmail(response.Email);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Session check failed:', error);
      return false;
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isRegistrationComplete,
      seedPhrase,
      userEmail, // Include userEmail in the context value
      login,
      register,
      confirmSeedPhrase,
      logout,
      checkSession, // Include checkSession in the context value
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);