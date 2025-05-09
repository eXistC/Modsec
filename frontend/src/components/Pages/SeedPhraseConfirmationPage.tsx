import React, { useState, useEffect, useRef } from 'react';
import { Shield, Copy, Check, AlertCircle, ExternalLink, Eye, EyeOff, CheckCircle2, HelpCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useRecoverySeedPhrase } from '../Recovery/RecoverySeedPhraseConfirmation';

interface SeedPhraseConfirmationPageProps {
  isRecovery?: boolean;
}

export function SeedPhraseConfirmationPage({ isRecovery = false }: SeedPhraseConfirmationPageProps) {
  // Get context from either Auth or RecoverySeedPhrase based on mode
  const authContext = useAuth();
  const recoveryContext = useRecoverySeedPhrase();
  
  // Use the appropriate context based on isRecovery
  const { seedPhrase, confirmSeedPhrase } = isRecovery ? recoveryContext : authContext;

  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [verificationInput, setVerificationInput] = useState('');
  const [verificationError, setVerificationError] = useState(false);
  const [isHidden, setIsHidden] = useState(true);
  const [progressValue, setProgressValue] = useState(0);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const { toast } = useToast();
  const verificationInputRef = useRef<HTMLTextAreaElement>(null);

  const words = seedPhrase?.split(' ') || [];

  // Track progress throughout the confirmation flow
  useEffect(() => {
    let value = 0;
    if (activeStep === 1) value = 25;
    if (activeStep === 2) value = 50;
    if (activeStep === 3) value = 75;
    if (hasConfirmed) value = 100;
    setProgressValue(value);
  }, [activeStep, hasConfirmed]);

  const handleCopy = async () => {
    if (!seedPhrase) return;

    try {
      await navigator.clipboard.writeText(seedPhrase);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Your recovery phrase has been copied to your clipboard. Store it securely.",
        duration: 3000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Copy failed",
        description: "Could not copy to clipboard. Please try again.",
      });
    }
  };

  const handleNextStep = () => {
    if (activeStep < 3) {
      setActiveStep(activeStep + 1);
      
      // Focus the verification input when moving to step 2
      if (activeStep === 1) {
        setTimeout(() => {
          verificationInputRef.current?.focus();
        }, 100);
      }
    }
  };

  const handleVerificationInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setVerificationInput(e.target.value);
    if (verificationError) {
      setVerificationError(false);
    }
  };

  const handleVerify = () => {
    // Normalize both seed phrases for comparison
    const normalizedOriginal = seedPhrase?.trim().toLowerCase() || '';
    const normalizedInput = verificationInput.trim().toLowerCase();
    
    // Check if they match exactly
    if (normalizedOriginal === normalizedInput) {
      setHasConfirmed(true);
      toast({
        title: "Verification successful",
        description: "You've correctly verified your recovery phrase.",
        duration: 3000,
      });
      setActiveStep(3);
    } else {
      setVerificationError(true);
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: "The recovery phrase doesn't match. Please check carefully and try again.",
      });
    }
  };

  const handleContinue = () => {
    if (hasConfirmed && hasAcknowledged) {
      toast({
        title: isRecovery ? "Recovery complete" : "Account secured",
        description: isRecovery 
          ? "Your account has been recovered with a new recovery phrase." 
          : "Your recovery phrase has been verified and saved.",
        duration: 3000,
      });
      confirmSeedPhrase();
    } else if (!hasConfirmed) {
      toast({
        variant: "destructive",
        title: "Verification required",
        description: "Please verify your recovery phrase before continuing.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Acknowledgment required",
        description: "Please confirm you've saved your recovery phrase securely.",
      });
    }
  };

  // Determine primary action based on current step
  const getPrimaryAction = () => {
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
        disabled: verificationInput.trim().length === 0
      };
    } else {
      return {
        label: isRecovery ? "Complete Recovery" : "Continue to ModSec",
        action: handleContinue,
        disabled: !hasAcknowledged || !hasConfirmed
      };
    }
  };

  const primaryAction = getPrimaryAction();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1E1E1E] p-4">
      <Card className="w-full max-w-[550px] animate-in fade-in-50 duration-500 zoom-in-95">
        <CardHeader className="text-center">
          <div className="w-full flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary animate-pulse" />
          </div>
          <CardTitle className="text-xl font-bold">
            {isRecovery ? "Secure Your New Recovery Phrase" : "Secure Your ModSec Account"}
          </CardTitle>
          <CardDescription className="text-sm mt-2">
            {isRecovery 
              ? "This new recovery phrase is the only way to restore your account in the future." 
              : "Your recovery phrase is the only way to restore your account if you lose access."}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">
              Step {activeStep} of 3: {activeStep === 1 ? "Save" : activeStep === 2 ? "Verify" : "Confirm"}
            </p>
            <p className="text-sm text-muted-foreground">{progressValue}% complete</p>
          </div>
          <Progress value={progressValue} className="h-2" />
          
          {/* Step 1: View & Save */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <div className="bg-secondary/40 p-6 rounded-lg relative group border border-secondary/60">
                <h3 className="text-sm font-medium mb-4">
                  {isRecovery ? "Your NEW 12-word recovery phrase:" : "Your 12-word recovery phrase:"}
                </h3>
                <div className="grid grid-cols-3 gap-x-4 gap-y-3">
                  {words.map((word, index) => (
                    <div key={index} className="flex items-center p-1.5 rounded-md bg-secondary/30">
                      <span className="text-sm font-medium text-muted-foreground mr-2">{index + 1}.</span>
                      <span className="font-mono text-sm font-semibold">{isHidden ? '••••••' : word}</span>
                    </div>
                  ))}
                </div>
                
                {/* Improved reveal button with better visibility and clarity */}
                <div className="mt-4 flex justify-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className={`w-full max-w-xs ${!isHidden ? "bg-secondary/60" : ""}`}
                    onClick={() => setIsHidden(!isHidden)}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {isHidden ? (
                        <>
                          <Eye className="h-4 w-4" />
                          <span>Reveal Recovery Phrase</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-4 w-4" />
                          <span>Hide Recovery Phrase</span>
                        </>
                      )}
                    </div>
                  </Button>
                </div>
                
                <div className="absolute right-3 top-3 flex space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="opacity-90 hover:opacity-100 hover:bg-secondary/70"
                          onClick={handleCopy}
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
              
              <div className="space-y-3">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-3 flex items-start space-x-3">
                  <HelpCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <strong className="font-medium text-blue-400">Tips for saving securely:</strong>
                    <ul className="list-disc ml-4 mt-1 text-muted-foreground">
                      <li>Write it down on paper - never store digitally</li>
                      <li>Store in a secure location like a safe</li>
                      <li>Never share these words with anyone</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 2: Verify Full Seed Phrase */}
          {activeStep === 2 && (
            <div className="space-y-5">
              <div className="bg-secondary/30 p-5 rounded-lg">
                <h3 className="text-sm font-medium mb-3">Verify your recovery phrase:</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Please enter your complete 12-word recovery phrase in the exact same order.
                </p>
                
                <div className="space-y-2">
                  <Textarea
                    ref={verificationInputRef}
                    placeholder="Enter all 12 words separated by spaces..."
                    className={cn(
                      "font-mono h-24 resize-none bg-secondary/30 border-secondary/50 focus-visible:border-primary",
                      verificationError ? "border-red-500 focus-visible:ring-red-500" : ""
                    )}
                    value={verificationInput}
                    onChange={handleVerificationInputChange}
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck="false"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleVerify();
                      }
                    }}
                  />
                  
                  {verificationError && (
                    <p className="text-sm text-red-500 mt-3 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1.5 flex-shrink-0" />
                      The recovery phrase doesn't match. Please check for typos or missing words.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Step 3: Final Confirmation */}
          {activeStep === 3 && (
            <div className="space-y-5">
              {hasConfirmed ? (
                <div className="bg-green-500/10 border border-green-500/30 rounded-md p-4 flex flex-col items-center space-y-3">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                  <h3 className="text-lg font-medium text-green-500">Verification Successful</h3>
                  <p className="text-sm text-center text-muted-foreground">
                    You've correctly verified your recovery phrase. 
                    Your account is now secured.
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
                    I understand that if I lose my recovery phrase, 
                    I will not be able to recover my account
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-md p-3 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <strong className="font-medium text-amber-500">Important:</strong> ModSec will never ask for your recovery phrase. Anyone who asks for it is trying to steal your account.
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-3">
          <div className="flex w-full space-x-3">
            {activeStep > 1 && activeStep < 3 && (
              <Button 
                variant="outline" 
                onClick={() => setActiveStep(activeStep - 1)}
                className="flex-1"
              >
                Back
              </Button>
            )}
            
            <Button 
              className={cn("flex-1", activeStep <= 1 || activeStep >= 3 ? "w-full" : "")}
              onClick={primaryAction.action}
              disabled={primaryAction.disabled}
            >
              {primaryAction.label}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}