import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { PasswordManager } from "./PasswordManager";
import { PasswordGenerator } from "./Generators/PasswordGenerator";
import { PasswordEditor } from "./PasswordEditor";
import { LoginPage } from "./Pages/LoginPage";
import { RegisterPage } from "./Pages/RegisterPage";
import { PasswordEntry } from "../types/password";
import { useAuth } from '@/context/AuthContext';

export function Layout() {
  const { isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState("passwords");
  const [selectedPassword, setSelectedPassword] = useState<PasswordEntry | undefined>();
  const [showRegister, setShowRegister] = useState(false);

  const handleSelectPassword = (password: PasswordEntry) => {
    setSelectedPassword(password);
  };

  const handleLogin = (masterPassword: string) => {
    // Implement your login logic here
    console.log("Logging in with:", masterPassword);
  };

  const handleRegister = (password: string, confirmPassword: string) => {
    // Implement your registration logic here
    console.log("Registering with:", password);
    setShowRegister(false);
  };

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