import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { PasswordManager } from "./PasswordManager";
import { PasswordGenerator } from "./PasswordGenerator";
import { PasswordEditor } from "./PasswordEditor";
import { PasswordEntry } from "../types/password";

export function Layout() {
  const [currentView, setCurrentView] = useState("passwords");
  const [selectedPassword, setSelectedPassword] = useState<PasswordEntry | undefined>();

  const handleSelectPassword = (password: PasswordEntry) => {
    setSelectedPassword(password);
  };

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