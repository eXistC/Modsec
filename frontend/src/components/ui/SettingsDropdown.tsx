import React, { useState } from "react";
import { Settings, LogOut, Trash2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SettingsOverlay } from "@/components/Overlays/SettingsOverlay";

interface SettingsDropdownProps {
  variant?: "settings" | "more";
  onLogout?: () => void;
  onDelete?: () => void;
}

export function SettingsDropdown({ 
  variant = "settings",
  onLogout,
  onDelete
}: SettingsDropdownProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:bg-secondary"
          >
            {variant === "settings" ? (
              <Settings className="h-4 w-4" />
            ) : (
              <MoreVertical className="h-4 w-4" />
            )}
            <span className="sr-only">Settings</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="start"
          side="bottom"
          sideOffset={5}
          className="w-48"
        >
          {variant === "settings" ? (
            <>
              <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-500 focus:text-red-500"
                onClick={onLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive" 
              onClick={(e) => {
                e.preventDefault(); 
                e.stopPropagation();
                onDelete && onDelete();
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <SettingsOverlay 
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </>
  )
}