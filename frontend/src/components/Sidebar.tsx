import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bookmark, FileText, Infinity, Settings, Trash2 } from "lucide-react";
import { CatList } from "@/components/CatList";
import { SettingsDropdown } from "./ui/SettingsDropdown";
import { useAuth } from "@/context/AuthContext";

// Add these props to handle view switching
interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  currentView?: string;
  onViewChange?: (view: string) => void;
}

export function Sidebar({ className, currentView = "passwords", onViewChange }: SidebarProps) {
  const { logout } = useAuth();

  const handleLogout = () => {
    try {
      logout();
    } catch (error) {
      console.error('Logout failed:', error);
      // Optionally show an error toast/notification here
    }
  };

  return (
    <div className={cn("border-r bg-[#1E1E1E]", className)}>
      <div className="flex h-[60px] items-center px-6 border-b border-border">
        <span className="text-sm">example@gmail.com</span>
        <div className="ml-auto">
          <SettingsDropdown 
            variant="settings"
            onLogout={handleLogout}
          />
        </div>
      </div>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <Button 
              variant={currentView === "passwords" ? "secondary" : "ghost"}
              className="w-full justify-start text-sm h-9"
              onClick={() => onViewChange?.("passwords")}
            >
              <FileText className="mr-2 h-4 w-4" />
              All Passwords
            </Button>
            <Button 
              variant={currentView === "bookmarks" ? "secondary" : "ghost"} 
              className="w-full justify-start text-sm h-9"
              onClick={() => onViewChange?.("bookmarks")}
            >
              <Bookmark className="mr-2 h-4 w-4" />
              Bookmark
            </Button>
            {/* Update the Generator button to handle clicks and show active state */}
            <Button 
              variant={currentView === "generator" ? "secondary" : "ghost"}
              className="w-full justify-start text-sm h-9"
              onClick={() => onViewChange?.("generator")}
            >
              <Infinity className="mr-2 h-4 w-4" />
              Generator
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-sm h-9"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Trash
            </Button>
          </div>
        </div>
        <CatList/>
      </div>
    </div>
  );
}