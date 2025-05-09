import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/AuthContext"; // Import useAuth
import { getUserTimezoneName, getUserTimezoneOffset } from "@/lib/utils"; // Import timezone utilities

interface SettingsOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsOverlay({ open, onOpenChange }: SettingsOverlayProps) {  const [darkMode, setDarkMode] = useState(true);
  const [autoLogout, setAutoLogout] = useState(true);
  const [logoutTime, setLogoutTime] = useState(5);
  const { userEmail } = useAuth(); // Get the user's email from auth context
  
  // Get timezone information for display
  const [timezone, setTimezone] = useState({
    name: getUserTimezoneName(),
    offset: getUserTimezoneOffset()
  });
  
  // Update timezone info if it changes (rare, but possible if user changes system settings)
  useEffect(() => {
    const updateTimezone = () => {
      setTimezone({
        name: getUserTimezoneName(),
        offset: getUserTimezoneOffset()
      });
    };
    
    // Update when component mounts and if the window regains focus
    window.addEventListener('focus', updateTimezone);
    
    return () => {
      window.removeEventListener('focus', updateTimezone);
    };
  }, []);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your application preferences
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
            <TabsContent value="general" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Enable dark mode for the application
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>
            
            {/* Timezone Info Section */}
            <div className="space-y-2 pt-4 border-t">
              <Label>Timezone Settings</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-sm font-medium">Timezone Name</div>
                  <div className="text-sm text-muted-foreground">{timezone.name || "Unknown"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Offset</div>
                  <div className="text-sm text-muted-foreground">
                    GMT{timezone.offset >= 0 ? '+' : ''}{timezone.offset}
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                The application automatically uses your device's timezone.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-logout">Auto Logout</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically logout after period of inactivity
                </p>
              </div>
              <Switch
                id="auto-logout"
                checked={autoLogout}
                onCheckedChange={setAutoLogout}
              />
            </div>
            
            {autoLogout && (
              <div className="space-y-2">
                <Label htmlFor="logout-time">Logout After (minutes)</Label>
                <Input
                  id="logout-time"
                  type="number"
                  value={logoutTime}
                  onChange={(e) => setLogoutTime(parseInt(e.target.value) || 5)}
                  min={1}
                />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="account" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={userEmail || ""} 
                placeholder="No email available" 
                disabled 
              />
              <p className="text-sm text-muted-foreground">
                We cannot change your email
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Change Password</Label>
              <Button variant="outline" className="w-full">Change Password</Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}