import { useState } from "react"; // Add this import
import { Sidebar } from "./Sidebar";
import { PasswordList } from "./PasswordList";
import { PasswordEditor } from "./PasswordEditor";
import { PasswordGenerator } from "./PasswordGenerator";

export function Layout() {
  // Add state to track which view is active
  const [currentView, setCurrentView] = useState("passwords");

  return (
    <div className="h-screen bg-[#1E1E1E]">
      <div className="grid h-full lg:grid-cols-[280px_400px_1fr]">
        {/* Pass the current view and a function to change it to Sidebar */}
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        <div className="border-r border-border">
          <PasswordList />
        </div>
        <div>
          {/* Show either PasswordEditor or PasswordGenerator based on currentView */}
          {currentView === "generator" ? <PasswordGenerator /> : <PasswordEditor />}
        </div>
      </div>
    </div>
  );
}