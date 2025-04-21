import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { LoginUser, RegisterUser } from '../../wailsjs/go/main/App';

interface AuthContextType {
  isAuthenticated: boolean;
  isRegistrationComplete: boolean;
  seedPhrase: string | null;
  userEmail: string | null; // Added userEmail to the interface
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, confirmPassword: string) => Promise<void>;
  confirmSeedPhrase: () => void;
  logout: () => void;
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
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);