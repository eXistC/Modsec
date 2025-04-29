import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Copy, Check, LockKeyhole } from "lucide-react";
import { RecoveryProcess } from "../../../wailsjs/go/main/App";
import { PasswordStrengthMeter, isPasswordValid } from "@/components/PasswordStrength/PasswordStrengthMeter";

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
  const [copied, setCopied] = useState(false);

  const resetForm = () => {
    setEmail("");
    setNewPassword("");
    setConfirmPassword("");
    setSeedPhrase("");
    setRecoveryMessage({ type: "", message: "" });
    setNewSeedPhrase("");
    setRecoveryComplete(false);
    setCopied(false);
  };

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
    
    // Check if seedphrase has 12 words
    const wordCount = seedPhrase.trim().split(/\s+/).length;
    if (wordCount !== 12) {
      setRecoveryMessage({ 
        type: "error", 
        message: `Seed phrase must contain exactly 12 words (found ${wordCount})` 
      });
      return;
    }
    
    // Use the isPasswordValid helper function from our component with email parameter
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
      
      console.log("Calling recovery process with:", { email, password: "******", seedPhrase: "******" });
      
      // Use the imported RecoveryProcess function instead of trying to access it through window.go.auth
      const response = await RecoveryProcess(email, newPassword, seedPhrase);
      
      console.log("Recovery successful, new seed phrase:", response);
      
      // Display the new seed phrase that was returned
      setNewSeedPhrase(response);
      setRecoveryComplete(true);
      setRecoveryMessage({ 
        type: "success", 
        message: "Password recovery successful. IMPORTANT: Save your new seed phrase below!" 
      });
      
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(newSeedPhrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>
            {recoveryMessage.message}
          </AlertDescription>
        </Alert>
      )}
      
      {!recoveryComplete ? (
        <>
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
            
            {/* Add the password strength meter with email */}
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
        </>
      ) : (
        <>
          <div className="space-y-2 bg-amber-50 dark:bg-amber-950 p-4 rounded-md border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 mb-2">
              <LockKeyhole className="h-5 w-5 text-amber-800 dark:text-amber-400" />
              <Label htmlFor="new-seed-phrase" className="text-amber-800 dark:text-amber-400 font-bold m-0">
                Your New Seed Phrase
              </Label>
            </div>
            <Textarea 
              id="new-seed-phrase" 
              value={newSeedPhrase}
              className="bg-white dark:bg-black font-mono text-amber-900 dark:text-amber-400 border-amber-300"
              rows={3}
              readOnly
            />
            <p className="text-sm text-amber-700 dark:text-amber-500 font-medium mt-2">
              WARNING: If you lose this seed phrase, you will not be able to recover your account again.
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1 gap-1"
              onClick={copyToClipboard}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy to Clipboard"}
            </Button>
            
            <Button 
              className="flex-1"
              onClick={() => {
                resetForm();
                onBack();
              }}
            >
              Finish
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
