import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bookmark, FileText, Infinity } from "lucide-react";
import { CatList } from "@/components/CatList";
import { SettingsDropdown } from "./ui/SettingsDropdown";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

// Add these props to handle view switching
interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  currentView?: string;
  onViewChange?: (view: string) => void;
}

export function Sidebar({ className, currentView = "passwords", onViewChange }: SidebarProps) {
  const { logout, userEmail } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    try {
      logout();
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "There was a problem logging out. Please try again.",
      });
    }
  };

  return (
    <div className={cn("h-full flex flex-col bg-[#1E1E1E] border-r", className)}>
      {/* Fixed header */}
      <div className="flex-shrink-0 h-[60px] items-center px-6 border-b border-border flex">
        <span className="text-sm font-medium truncate" title={userEmail || ""}>
          {userEmail || "Not logged in"}
        </span>
        <div className="ml-auto">
          <SettingsDropdown 
            variant="settings"
            onLogout={handleLogout}
          />
        </div>
      </div>
      
      {/* Scrollable content */}
      <div className="flex-grow flex flex-col overflow-hidden py-4">
        {/* Fixed navigation buttons */}
        <div className="px-3 flex-shrink-0">
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
            <Button 
              variant={currentView === "generator" ? "secondary" : "ghost"}
              className="w-full justify-start text-sm h-9"
              onClick={() => onViewChange?.("generator")}
            >
              <Infinity className="mr-2 h-4 w-4" />
              Generator
            </Button>
          </div>
        </div>
        
        {/* Scrollable category list - apply custom-scrollbar class */}
        <div className="flex-grow overflow-auto custom-scrollbar mt-4">
          <CatList />
        </div>
      </div>
    </div>
  );
}