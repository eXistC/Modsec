import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { PasswordManager } from "./PasswordManager";
import { PasswordGenerator } from "./PasswordGenerator";
import { PasswordEditor } from "./PasswordEditor";
import { LoginPage } from "./LoginPage";
import { PasswordEntry } from "../types/password";

export function Layout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState("passwords");
  const [selectedPassword, setSelectedPassword] = useState<PasswordEntry | undefined>();

  const handleLogin = (masterPassword: string) => {
    // Authen Logic Here
    setIsAuthenticated(true);
  };

  const handleSelectPassword = (password: PasswordEntry) => {
    setSelectedPassword(password);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen bg-[#1E1E1E]">
      <div className="grid h-full lg:grid-cols-[280px_400px_1fr]">
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