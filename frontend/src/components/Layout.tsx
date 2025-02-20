import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { LoginPage } from "./Pages/LoginPage";
import { RegisterPage } from "./Pages/RegisterPage";
import { Sidebar } from "./Sidebar";
import { PasswordManager } from "./PasswordManager";
import { PasswordGenerator } from "./Generators/PasswordGenerator";
import { PasswordEditor } from "./PasswordEditor";
import { PasswordEntry, Category } from "@/types/password";
import { extractCategories } from "@/lib/categories";
import { mockPasswords } from "@/lib/mockData";
import { PasswordList } from "./PasswordList";

export function Layout() {
  const { isAuthenticated, login, register } = useAuth();
  const [currentView, setCurrentView] = useState("passwords");
  const [selectedPassword, setSelectedPassword] = useState<PasswordEntry | undefined>();
  const [showRegister, setShowRegister] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  // Initialize with mockPasswords for development
  const [passwords, setPasswords] = useState<PasswordEntry[]>(mockPasswords);
  const categories = extractCategories(passwords);

  const handleSelectPassword = (password: PasswordEntry) => {
    console.log('Selected password:', password);
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

  const handleSelectCategory = (category: string | null) => {
    setSelectedCategory(category);
  };

  const handlePasswordSave = (updatedPassword: PasswordEntry) => {
    setPasswords(prev => 
      prev.map(p => p.id === updatedPassword.id ? updatedPassword : p)
    );
    setSelectedPassword(updatedPassword);
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
    <div className="h-screen bg-[#1E1E1E] overflow-hidden">
      <div className="grid h-full md:grid-cols-[240px_280px_1fr]">
        <Sidebar 
          currentView={currentView}
          onViewChange={setCurrentView}
          passwords={passwords}
          categories={categories}
          onCategorySelect={handleSelectCategory}
        />
        <div className="border-r border-border h-full overflow-hidden">
          {currentView === "generator" ? (
            <PasswordGenerator />
          ) : (
            <PasswordList 
              currentView={currentView}
              onSelectPassword={handleSelectPassword}
              passwords={passwords}
              onToggleBookmark={(id) => {
                setPasswords(prev => 
                  prev.map(p => p.id === id ? { ...p, isBookmarked: !p.isBookmarked } : p)
                );
              }}
              selectedCategory={selectedCategory}
            />
          )}
        </div>
        <div className="border-l border-border h-full overflow-auto bg-background">
          {selectedPassword ? (
            <PasswordEditor
              key={selectedPassword.id} // Add key to force re-render
              password={selectedPassword}
              isOpen={true}
              categories={categories}
              onSave={handlePasswordSave}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Select an item to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}