import { useState } from "react";
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
  const { isAuthenticated, login, register, isRegistrationComplete } = useAuth();
  const [currentView, setCurrentView] = useState("passwords");
  const [selectedPassword, setSelectedPassword] = useState<PasswordEntry | undefined>();
  const [showRegister, setShowRegister] = useState(false);
  const { toast } = useToast();

  const handleSelectPassword = (password: PasswordEntry) => {
    setSelectedPassword(password);
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      toast({
        title: "Login successful",
        description: "Welcome to ModSec!"
      });
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Invalid email or password. Please try again."
      });
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
        <div className="h-screen bg-[#1E1E1E]">
          <div className="grid h-full md:grid-cols-[240px_280px_1fr]">
            <Sidebar 
              currentView={currentView} 
              onViewChange={setCurrentView} 
            />
            <div className="border-r border-border">
              {currentView === "generator" ? (
                <PasswordGenerator />
              ) : (
                <PasswordManager 
                  currentView={currentView}
                  onSelectPassword={handleSelectPassword}
                  selectedPassword={selectedPassword}
                />
              )}
            </div>
            <div className="border-0 border-border">
              {selectedPassword && (
                <PasswordEditor
                  password={selectedPassword}
                  isOpen={true}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </ColorSettingsProvider>
  );
}