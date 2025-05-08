import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { RecoveryProcess } from "../../../wailsjs/go/main/App";
import { PasswordStrengthMeter, isPasswordValid } from "@/components/PasswordStrength/PasswordStrengthMeter";
import { cn } from "@/lib/utils";
import { RecoverySeedPhraseConfirmation } from "./RecoverySeedPhraseConfirmation";

interface RecoveryFormProps {
  onBack: () => void;
}

export function RecoveryForm({ onBack }: RecoveryFormProps) {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [seedPhrase, setSeedPhrase] = useState("");
  const [recoveryMessage, setRecoveryMessage] = useState({ type: "", message: "" });
  const [isRecovering, setIsRecovering] = useState(false);
  const [newSeedPhrase, setNewSeedPhrase] = useState("");
  const [recoveryComplete, setRecoveryComplete] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (!email.trim()) {
      setRecoveryMessage({ type: "error", message: "Email is required" });
      return;
    }
    
    if (!seedPhrase.trim()) {
      setRecoveryMessage({ type: "error", message: "Seed phrase is required" });
      return;
    }
    
    const wordCount = seedPhrase.trim().split(/\s+/).length;
    if (wordCount !== 12) {
      setRecoveryMessage({ 
        type: "error", 
        message: `Seed phrase must contain exactly 12 words (found ${wordCount})` 
      });
      return;
    }
    
    if (!isPasswordValid(newPassword, email)) {
      setRecoveryMessage({ 
        type: "error", 
        message: "Password does not meet security requirements" 
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setRecoveryMessage({ type: "error", message: "Passwords do not match" });
      return;
    }
    
    try {
      setIsRecovering(true);
      setRecoveryMessage({ type: "info", message: "Processing recovery request..." });
      
      const response = await RecoveryProcess(email, newPassword, seedPhrase);
      
      // Store the new seed phrase and show the confirmation UI
      setNewSeedPhrase(response);
      setRecoveryComplete(true);
      
    } catch (error) {
      console.error("Recovery error:", error);
      setRecoveryMessage({ 
        type: "error", 
        message: error instanceof Error 
          ? `Recovery failed: ${error.message}` 
          : "Recovery failed. Please check your email and seed phrase." 
      });
    } finally {
      setIsRecovering(false);
    }
  };

  const handleSeedPhraseConfirmed = () => {
    // This is called when the seed phrase is confirmed in SeedPhraseConfirmationPage
    setRecoveryMessage({
      type: "success",
      message: "Account recovery complete! Your account is now secured with the new seed phrase."
    });
    
    setTimeout(() => {
      // Reset form and return to login
      setEmail("");
      setNewPassword("");
      setConfirmPassword("");
      setSeedPhrase("");
      setNewSeedPhrase("");
      setRecoveryComplete(false);
      onBack();
    }, 2000);
  };

  // If recovery is complete and we have a new seed phrase, show the confirmation page
  if (recoveryComplete && newSeedPhrase) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <RecoverySeedPhraseConfirmation 
          seedPhrase={newSeedPhrase}
          onConfirmed={handleSeedPhraseConfirmed}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Password Recovery</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
        >
          Back
        </Button>
      </div>
      
      {recoveryMessage.message && (
        <Alert variant={recoveryMessage.type === "error" ? "destructive" : "default"}>
          <AlertCircle className={cn(
            "h-4 w-4 mr-2",
            recoveryMessage.type === "success" ? "text-green-500" : ""
          )} />
          <AlertDescription className={recoveryMessage.type === "success" ? "text-green-500" : ""}>
            {recoveryMessage.message}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="recovery-email">Email</Label>
        <Input 
          id="recovery-email" 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your account email"
          disabled={isRecovering}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="seed-phrase">
          Seed Phrase
          <span className="text-sm font-normal text-muted-foreground ml-1">
            (12 words separated by spaces)
          </span>
        </Label>
        <Textarea 
          id="seed-phrase" 
          value={seedPhrase}
          onChange={(e) => setSeedPhrase(e.target.value)}
          placeholder="Enter your 12-word seed phrase"
          rows={3}
          disabled={isRecovering}
        />
        <p className="text-xs text-muted-foreground">
          This is the seed phrase you received when you set up recovery for your account.
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="new-password">New Password</Label>
        <Input 
          id="new-password" 
          type="password" 
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter new password"
          disabled={isRecovering}
        />
        
        {newPassword.length > 0 && (
          <PasswordStrengthMeter password={newPassword} email={email} />
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <Input 
          id="confirm-password" 
          type="password" 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          disabled={isRecovering}
        />
      </div>
      
      <Button 
        className="w-full" 
        onClick={handleSubmit}
        disabled={isRecovering}
      >
        {isRecovering ? "Processing..." : "Recover Password"}
      </Button>
    </div>
  );
}
