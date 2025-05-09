import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { LoginPage } from "./Pages/LoginPage";
import { RegisterPage } from "./Pages/RegisterPage";
import { Sidebar } from "./Sidebar";
import { PasswordManager } from "./PasswordManager";
import { PasswordGenerator } from "./Generators/PasswordGenerator";
import { PasswordEditor } from "./PasswordEditor";
import { PasswordEntry } from "@/types/password";
import { ColorSettingsProvider } from "@/context/ColorSettingsContext";
import { useToast } from "@/components/ui/use-toast";
import { SeedPhraseConfirmationPage } from './Pages/SeedPhraseConfirmationPage';

export function Layout() {
  const { isAuthenticated, login, register, isRegistrationComplete, checkSession } = useAuth();
  const [currentView, setCurrentView] = useState("passwords");
  const [selectedPassword, setSelectedPassword] = useState<PasswordEntry | undefined>();
  const [showRegister, setShowRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const { toast } = useToast();

  // Check for existing session on load
  useEffect(() => {
    const verifySession = async () => {
      try {
        await checkSession();
      } catch (error) {
        console.error("Session verification failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, [checkSession]);

  // Show loading indicator while checking session
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#1E1E1E]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleSelectPassword = (password: PasswordEntry) => {
    setSelectedPassword(password);
  };

  // Update login handler to properly return a boolean and propagate errors
  const handleLogin = async (email: string, password: string) => {
    try {
      const success = await login(email, password);
      if (success) {
        // Optional: show success toast
        toast({
          title: "Login successful",
          description: "Welcome back to ModSec",
        });
        return true;
      } else {
        // Login function returned false
        return false;
      }
    } catch (error) {
      console.error("Login failed:", error);
      // Re-throw the error to be caught by the LoginPage
      throw error;
    }
  };

  const handleRegister = async (email: string, password: string, confirmPassword: string) => {
    try {
      await register(email, password, confirmPassword);
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully!"
      });
      setShowRegister(false);
    } catch (error) {
      console.error("Registration failed:", error);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "There was a problem creating your account. Please try again."
      });
    }
  };

  const handlePasswordUpdate = (updatedPassword: PasswordEntry) => {
    // Update the selected password
    setSelectedPassword(updatedPassword);
    
    // Trigger a refresh of the password list
    setRefreshCounter(prev => prev + 1);
  };

  return (
    <ColorSettingsProvider>
      {!isAuthenticated ? (
        // Authentication UI
        showRegister ? (
          <RegisterPage 
            onRegister={handleRegister}
            onLoginClick={() => setShowRegister(false)}
          />
        ) : (
          <LoginPage 
            onLogin={handleLogin}
            onRegisterClick={() => setShowRegister(true)}
          />
        )
      ) : !isRegistrationComplete ? (
        // Show seed phrase confirmation page for new users
        <SeedPhraseConfirmationPage />
      ) : (
        // Main application UI
        <div className="h-screen bg-[#1E1E1E] overflow-hidden">
          <div className="grid h-full md:grid-cols-[240px_280px_1fr]">
            <div className="h-screen overflow-hidden">
              <Sidebar 
                currentView={currentView} 
                onViewChange={setCurrentView} 
              />
            </div>
            <div className="border-r border-border h-screen overflow-hidden">
              {currentView === "generator" ? (
                <PasswordGenerator />
              ) : (
                <PasswordManager 
                  currentView={currentView}
                  onSelectPassword={handleSelectPassword}
                  selectedPassword={selectedPassword}
                  refreshTrigger={refreshCounter}
                />
              )}
            </div>
            <div className="border-0 border-border h-screen overflow-hidden">
              {selectedPassword && (
                <PasswordEditor
                  password={selectedPassword}
                  isOpen={true}
                  onDelete={(deletedItemId: number) => { 
                    setSelectedPassword(undefined);
                    // Also trigger refresh on delete
                    setRefreshCounter(prev => prev + 1);
                  }}
                  onUpdate={handlePasswordUpdate}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </ColorSettingsProvider>
  );
}