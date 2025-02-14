import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { LoginPage } from "./Pages/LoginPage";
import { RegisterPage } from "./Pages/RegisterPage";
import { Sidebar } from "./Sidebar";
import { PasswordManager } from "./PasswordManager";
import { PasswordGenerator } from "./Generators/PasswordGenerator";
import { PasswordEditor } from "./PasswordEditor";
import { PasswordEntry } from "@/types/password";

export function Layout() {
  const { isAuthenticated, login, register } = useAuth();
  const [currentView, setCurrentView] = useState("passwords");
  const [selectedPassword, setSelectedPassword] = useState<PasswordEntry | undefined>();
  const [showRegister, setShowRegister] = useState(false);

  const handleSelectPassword = (password: PasswordEntry) => {
    setSelectedPassword(password);
  };

  const handleLogin = async (masterPassword: string) => {
    try {
      await login(masterPassword);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleRegister = async (password: string, confirmPassword: string) => {
    try {
      await register(password);
      setShowRegister(false);
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  // Show authentication pages if not authenticated
  if (!isAuthenticated) {
    if (showRegister) {
      return (
        <RegisterPage 
          onRegister={handleRegister}
          onLoginClick={() => setShowRegister(false)}
        />
      );
    }
    return (
      <LoginPage 
        onLogin={handleLogin}
        onRegisterClick={() => setShowRegister(true)}
      />
    );
  }

  // Show main application layout when authenticated
  return (
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
  );
}