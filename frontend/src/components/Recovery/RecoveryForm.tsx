import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertCircle, 
  Copy, 
  Check, 
  LockKeyhole,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from '@/components/ui/checkbox';
import { RecoveryProcess } from "../../../wailsjs/go/main/App";
import { PasswordStrengthMeter, isPasswordValid } from "@/components/PasswordStrength/PasswordStrengthMeter";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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
  const [activeStep, setActiveStep] = useState(1);
  const [isHidden, setIsHidden] = useState(true);
  const [progressValue, setProgressValue] = useState(25);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);

  const seedPhraseRef = useRef<HTMLTextAreaElement>(null);

  const words = newSeedPhrase ? newSeedPhrase.split(' ') : [];

  const resetForm = () => {
    setEmail("");
    setNewPassword("");
    setConfirmPassword("");
    setSeedPhrase("");
    setRecoveryMessage({ type: "", message: "" });
    setNewSeedPhrase("");
    setRecoveryComplete(false);
    setCopied(false);
    setActiveStep(1);
    setHasAcknowledged(false);
    setHasConfirmed(false);
  };

  const handleSubmit = async () => {
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
      
      setNewSeedPhrase(response);
      setRecoveryComplete(true);
      setActiveStep(1);
      setRecoveryMessage({ 
        type: "success", 
        message: "Password recovery successful. Please save your NEW seed phrase below!" 
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
    if (!newSeedPhrase) return;
    
    navigator.clipboard.writeText(newSeedPhrase);
    setCopied(true);
    setRecoveryMessage({ 
      type: "success", 
      message: "Seed phrase copied to clipboard. Store it securely." 
    });
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleNextStep = () => {
    if (activeStep < 3) {
      setActiveStep(activeStep + 1);
      setProgressValue((activeStep + 1) * 25);
      
      if (activeStep === 1) {
        setTimeout(() => {
          seedPhraseRef.current?.focus();
        }, 100);
      }
    }
  };
  
  const handleVerify = () => {
    const normalizedInput = seedPhrase.trim().toLowerCase();
    const normalizedNew = newSeedPhrase.trim().toLowerCase();
    
    if (normalizedInput === normalizedNew) {
      setHasConfirmed(true);
      setRecoveryMessage({
        type: "success", 
        message: "You've correctly verified your new recovery phrase."
      });
      setActiveStep(3);
      setProgressValue(75);
    } else {
      setRecoveryMessage({
        type: "error",
        message: "The recovery phrase doesn't match. Please check carefully and try again."
      });
    }
  };
  
  const handleFinish = () => {
    if (hasConfirmed && hasAcknowledged) {
      setRecoveryMessage({
        type: "success",
        message: "Account recovery complete! Your account is now secured with the new seed phrase."
      });
      setProgressValue(100);
      
      setTimeout(() => {
        resetForm();
        onBack();
      }, 2000);
    } else if (!hasConfirmed) {
      setRecoveryMessage({
        type: "error",
        message: "Please verify your recovery phrase before continuing."
      });
    } else {
      setRecoveryMessage({
        type: "error",
        message: "Please confirm you've saved your recovery phrase securely."
      });
    }
  };

  const getPrimaryAction = () => {
    if (!recoveryComplete) {
      return {
        label: isRecovering ? "Processing..." : "Recover Password",
        action: handleSubmit,
        disabled: isRecovering
      };
    } else {
      if (activeStep === 1) {
        return {
          label: "Continue to verification",
          action: handleNextStep,
          disabled: isHidden
        };
      } else if (activeStep === 2) {
        return {
          label: "Verify Phrase",
          action: handleVerify,
          disabled: !seedPhrase.trim()
        };
      } else {
        return {
          label: "Complete Recovery",
          action: handleFinish,
          disabled: !hasAcknowledged || !hasConfirmed
        };
      }
    }
  };
  
  const primaryAction = getPrimaryAction();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Password Recovery</h3>
        {!recoveryComplete && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
          >
            Back
          </Button>
        )}
      </div>
      
      {recoveryMessage.message && (
        <Alert variant={
          recoveryMessage.type === "error" ? "destructive" : 
          recoveryMessage.type === "success" ? "success" :
          "default"
        }>
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
        <div className="space-y-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">
              Step {activeStep} of 3: {activeStep === 1 ? "Save" : activeStep === 2 ? "Verify" : "Confirm"}
            </p>
            <p className="text-sm text-muted-foreground">{progressValue}% complete</p>
          </div>
          <Progress value={progressValue} className="h-2" />
          
          {activeStep === 1 && (
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg relative border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-5 w-5 text-amber-800 dark:text-amber-400" />
                  <h3 className="text-sm font-bold text-amber-800 dark:text-amber-400">Your NEW Recovery Phrase:</h3>
                </div>
                
                <div className="grid grid-cols-3 gap-x-3 gap-y-2 mb-3">
                  {words.map((word, index) => (
                    <div key={index} className="flex items-center p-1.5 rounded-md bg-white/60 dark:bg-black/30">
                      <span className="text-xs font-medium text-muted-foreground mr-1.5">{index + 1}.</span>
                      <span className="font-mono text-sm font-semibold text-amber-900 dark:text-amber-400">
                        {isHidden ? '••••••' : word}
                      </span>
                    </div>
                  ))}
                </div>
                
                <p className="text-sm text-amber-700 dark:text-amber-500 font-medium mt-2">
                  WARNING: If you lose this seed phrase, you will not be able to recover your account again.
                </p>
                
                <div className="absolute right-3 top-3 flex space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="opacity-90 hover:opacity-100"
                          onClick={() => setIsHidden(!isHidden)}
                        >
                          {isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isHidden ? "Show" : "Hide"} recovery phrase</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="opacity-90 hover:opacity-100"
                          onClick={copyToClipboard}
                        >
                          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy to clipboard</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          )}
          
          {activeStep === 2 && (
            <div className="space-y-3">
              <div className="bg-secondary/30 p-4 rounded-lg">
                <h3 className="text-sm font-medium mb-3">Verify your new recovery phrase:</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Please enter your complete 12-word recovery phrase in the exact same order.
                </p>
                
                <Textarea 
                  ref={seedPhraseRef}
                  placeholder="Enter all 12 words separated by spaces..."
                  className={cn(
                    "font-mono h-24 resize-none",
                    hasConfirmed ? "border-green-500 focus:ring-green-500" : ""
                  )}
                  value={seedPhrase}
                  onChange={(e) => setSeedPhrase(e.target.value)}
                />
              </div>
            </div>
          )}
          
          {activeStep === 3 && (
            <div className="space-y-4">
              {hasConfirmed ? (
                <div className="bg-green-500/10 border border-green-500/30 rounded-md p-4 flex flex-col items-center space-y-3">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                  <h3 className="text-lg font-medium text-green-500">Verification Successful</h3>
                  <p className="text-sm text-center text-muted-foreground">
                    You've correctly verified your new recovery phrase. Your account is now secured.
                  </p>
                </div>
              ) : (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-md p-4">
                  <h3 className="text-sm font-medium text-amber-500 mb-2">Verification required</h3>
                  <p className="text-sm text-muted-foreground">
                    You need to successfully verify your recovery phrase before continuing.
                  </p>
                  <Button 
                    variant="outline"
                    className="mt-3 w-full"
                    onClick={() => setActiveStep(2)}
                  >
                    Go back to verification
                  </Button>
                </div>
              )}
              
              <div className="flex items-start space-x-3 pt-2">
                <Checkbox 
                  id="confirm" 
                  checked={hasAcknowledged}
                  onCheckedChange={(checked) => setHasAcknowledged(checked === true)}
                  className="mt-1"
                  disabled={!hasConfirmed}
                />
                <div className="grid gap-1 leading-none">
                  <label
                    htmlFor="confirm"
                    className={cn(
                      "text-sm font-medium leading-none",
                      !hasConfirmed && "opacity-50"
                    )}
                  >
                    I've securely saved my recovery phrase
                  </label>
                  <p className={cn(
                    "text-xs text-muted-foreground",
                    !hasConfirmed && "opacity-50"
                  )}>
                    I understand that if I lose this recovery phrase, I will not be able to recover my account
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex w-full space-x-3 mt-4">
            {activeStep > 1 && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setActiveStep(activeStep - 1);
                  setProgressValue((activeStep - 1) * 25);
                }}
                className="flex-1"
              >
                Back
              </Button>
            )}
            
            <Button 
              className={cn("flex-1", activeStep === 1 ? "w-full" : "")}
              onClick={primaryAction.action}
              disabled={primaryAction.disabled}
            >
              {primaryAction.label}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
