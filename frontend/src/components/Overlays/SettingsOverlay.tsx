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
import { CreditCard, File, Globe, User, Wallet } from "lucide-react";
import { useColorSettings } from "@/context/ColorSettingsContext";
import { RecoveryForm } from "@/components/Recovery/RecoveryForm";

interface SettingsOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsOverlay({ open, onOpenChange }: SettingsOverlayProps) {
  const { colors, updateColor, resetColors } = useColorSettings();
  const [autoLogout, setAutoLogout] = useState(true);
  const [logoutTime, setLogoutTime] = useState(5);
  const [localColors, setLocalColors] = useState(colors);
  
  // Add recovery mode state
  const [recoveryMode, setRecoveryMode] = useState(false);
  
  // Update local colors when context colors change or dialog opens
  useEffect(() => {
    setLocalColors({...colors});
  }, [colors, open]);
  
  const handleSave = () => {
    // Save all color changes at once
    Object.entries(localColors).forEach(([type, color]) => {
      updateColor(type as keyof typeof colors, color);
    });
    onOpenChange(false);
  };
  
  const handleColorChange = (type: keyof typeof colors, value: string) => {
    setLocalColors(prev => ({
      ...prev,
      [type]: value
    }));
  };
  
  const handleReset = () => {
    resetColors();
    setLocalColors({...colors});
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your application preferences
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
          
          {/* Appearance tab content */}
          <TabsContent value="appearance" className="space-y-6 mt-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium">Icon Colors</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleReset}
                >
                  Reset to Default
                </Button>
              </div>
              
              <div className="space-y-4">
                {/* Color inputs remain unchanged */}
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center h-8 w-8 rounded-lg bg-opacity-10`} 
                    style={{ backgroundColor: `${localColors.website}20`, color: localColors.website }}>
                    <Globe className="h-5 w-5" />
                  </div>
                  <Label className="min-w-[80px]" htmlFor="website-color">Website</Label>
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      id="website-color"
                      type="color"
                      value={localColors.website}
                      onChange={(e) => handleColorChange('website', e.target.value)}
                      className="w-12 h-8 p-0 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={localColors.website}
                      onChange={(e) => handleColorChange('website', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center h-8 w-8 rounded-lg bg-opacity-10`}
                    style={{ backgroundColor: `${localColors.identity}20`, color: localColors.identity }}>
                    <User className="h-5 w-5" />
                  </div>
                  <Label className="min-w-[80px]" htmlFor="identity-color">Identity</Label>
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      id="identity-color"
                      type="color"
                      value={localColors.identity}
                      onChange={(e) => handleColorChange('identity', e.target.value)}
                      className="w-12 h-8 p-0 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={localColors.identity}
                      onChange={(e) => handleColorChange('identity', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center h-8 w-8 rounded-lg bg-opacity-10`}
                    style={{ backgroundColor: `${localColors.card}20`, color: localColors.card }}>
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <Label className="min-w-[80px]" htmlFor="card-color">Card</Label>
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      id="card-color"
                      type="color"
                      value={localColors.card}
                      onChange={(e) => handleColorChange('card', e.target.value)}
                      className="w-12 h-8 p-0 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={localColors.card}
                      onChange={(e) => handleColorChange('card', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center h-8 w-8 rounded-lg bg-opacity-10`}
                    style={{ backgroundColor: `${localColors.crypto}20`, color: localColors.crypto }}>
                    <Wallet className="h-5 w-5" />
                  </div>
                  <Label className="min-w-[80px]" htmlFor="crypto-color">Crypto</Label>
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      id="crypto-color"
                      type="color"
                      value={localColors.crypto}
                      onChange={(e) => handleColorChange('crypto', e.target.value)}
                      className="w-12 h-8 p-0 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={localColors.crypto}
                      onChange={(e) => handleColorChange('crypto', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center h-8 w-8 rounded-lg bg-opacity-10`}
                    style={{ backgroundColor: `${localColors.memo}20`, color: localColors.memo }}>
                    <File className="h-5 w-5" />
                  </div>
                  <Label className="min-w-[80px]" htmlFor="memo-color">Memo</Label>
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      id="memo-color"
                      type="color"
                      value={localColors.memo}
                      onChange={(e) => handleColorChange('memo', e.target.value)}
                      className="w-12 h-8 p-0 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={localColors.memo}
                      onChange={(e) => handleColorChange('memo', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
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
            {!recoveryMode ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password-management">Password Recovery</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Recover your account using your seed phrase if you forgot your password
                  </p>
                  <Button 
                    variant="secondary" 
                    className="w-full"
                    onClick={() => setRecoveryMode(true)}
                  >
                    Recover with Seed Phrase
                  </Button>
                </div>
              </>
            ) : (
              <RecoveryForm onBack={() => setRecoveryMode(false)} />
            )}
          </TabsContent>
        </Tabs>
        
        {!recoveryMode && (
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}