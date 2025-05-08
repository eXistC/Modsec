import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { LoginUser, RegisterUser, CheckSession, LogoutUser } from '../../wailsjs/go/main/App';

interface AuthContextType {
  isAuthenticated: boolean;
  isRegistrationComplete: boolean;
  seedPhrase: string | null;
  userEmail: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, confirmPassword: string) => Promise<void>;
  confirmSeedPhrase: () => void;
  logout: () => Promise<boolean>;
  checkSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isRegistrationComplete: false,
  seedPhrase: null,
  userEmail: null,
  login: async () => false,
  register: async () => {},
  confirmSeedPhrase: () => {},
  logout: async () => false,
  checkSession: async () => false,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isRegistrationComplete, setIsRegistrationComplete] = useState<boolean>(true);
  const [seedPhrase, setSeedPhrase] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem('userEmail') || '';
  });

  const login = useCallback(async (email: string, password: string) => {
    try {
      // First, generate the master key from the password and email
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      // Call the LoginUser function (Go function)
      const response = await LoginUser(email, password);
      
      // Check for success status in the response
      if (response && response.success) {
        setIsAuthenticated(true);
        setUserEmail(email);
        localStorage.setItem('userEmail', email);
        return true;
      } else if (response) {
        // If there's a response but success is false, use the message from the response
        throw new Error(response.message || "Login failed");
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      console.error('Login failed:', error);
      
      // Don't transform the error here - pass it through directly
      throw error;
    }
  }, []);

  const register = async (email: string, password: string, confirmPassword: string) => {
    try {
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      const response = await RegisterUser(email, password);
      if (response) {
        setSeedPhrase(response);
        setIsRegistrationComplete(false);
        setIsAuthenticated(true);
        setUserEmail(email);
        localStorage.setItem('userEmail', email);
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

  const logout = useCallback(async () => {
    try {
      // LogoutUser returns {success, message} object not a boolean
      const response = await LogoutUser();
      
      // Check if the response indicates success
      if (response && response.Success) {
        setIsAuthenticated(false);
        setUserEmail('');
        localStorage.removeItem('userEmail');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Logout failed:', error);
      return false;
    }
  }, []);

  const checkSession = useCallback(async () => {
    try {
      const response = await CheckSession();
      if (response && response.Success) {
        setIsAuthenticated(true);
        return true;
      } else {
        setIsAuthenticated(false);
        setUserEmail('');
        localStorage.removeItem('userEmail');
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
      userEmail,
      login,
      register,
      confirmSeedPhrase,
      logout,
      checkSession,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);