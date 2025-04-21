import React, { useState, useEffect } from 'react';
import { Shield, Copy, Check, AlertCircle, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from "@/components/ui/progress";

export function SeedPhraseConfirmationPage() {
  const { seedPhrase, confirmSeedPhrase } = useAuth();
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('view');
  const [verificationInput, setVerificationInput] = useState('');
  const [verificationError, setVerificationError] = useState(false);
  const [isHidden, setIsHidden] = useState(true);
  const [progressValue, setProgressValue] = useState(0);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const { toast } = useToast();

  // Track progress throughout the confirmation flow
  useEffect(() => {
    let value = 0;
    if (!isHidden) value += 25; // Viewed the phrase
    if (activeTab === 'verify') value += 25; // Started verification
    if (hasConfirmed) value += 50; // Successfully verified
    setProgressValue(value);
  }, [isHidden, activeTab, hasConfirmed]);

  const handleCopy = async () => {
    if (!seedPhrase) return;

    try {
      await navigator.clipboard.writeText(seedPhrase);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Your recovery phrase has been copied to your clipboard.",
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

  const handleVerifyInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVerificationInput(e.target.value);
    setVerificationError(false);
  };

  const handleVerify = () => {
    // Clean up input to compare (remove extra spaces, make lowercase, etc.)
    const cleanInput = verificationInput.trim().toLowerCase();
    const cleanSeedPhrase = seedPhrase?.trim().toLowerCase() || '';
    
    if (cleanInput === cleanSeedPhrase) {
      setHasConfirmed(true);
      toast({
        title: "Verification successful",
        description: "You've correctly verified your recovery phrase.",
        duration: 3000,
      });
      setActiveTab('view'); // Switch back to view tab
    } else {
      setVerificationError(true);
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: "The recovery phrase you entered doesn't match. Please try again.",
      });
    }
  };

  const handleContinue = () => {
    if (hasConfirmed && hasAcknowledged) {
      toast({
        title: "Account secured",
        description: "Your recovery phrase has been verified and saved.",
        duration: 3000,
      });
      confirmSeedPhrase();
    } else if (!hasConfirmed) {
      toast({
        variant: "destructive",
        title: "Verification required",
        description: "Please verify your recovery phrase before continuing.",
      });
      setActiveTab('verify');
    } else {
      toast({
        variant: "destructive",
        title: "Acknowledgment required",
        description: "Please confirm you've saved your recovery phrase securely.",
      });
    }
  };

  const words = seedPhrase?.split(' ') || [];
  
  // When user presses Enter in verification field, trigger verify
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#1E1E1E]">
      <Card className="w-[500px] animate-in fade-in-50 duration-500 zoom-in-95">
        <CardHeader className="text-center">
          <div className="w-full flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary animate-pulse" />
          </div>
          <CardTitle className="text-xl">Your Recovery Phrase</CardTitle>
          <CardDescription className="text-sm">
            Write down or copy these 12 words in the correct order and store them securely.
            You'll need them to recover your account if you forget your password.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Progress value={progressValue} className="mb-4" />
          <Tabs defaultValue="view" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="view">View Phrase</TabsTrigger>
              <TabsTrigger value="verify">Verify Phrase</TabsTrigger>
            </TabsList>
            
            <TabsContent value="view" className="pt-4">
              <div className="bg-secondary/40 p-4 rounded-md relative group">
                <div className="grid grid-cols-3 gap-3">
                  {words.map((word, index) => (
                    <div key={index} className="flex items-center">
                      <span className="text-sm text-muted-foreground mr-1">{index + 1}.</span>
                      <span className="font-mono text-sm">{isHidden ? '••••' : word}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-2 top-2 opacity-80 group-hover:opacity-100"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-10 top-2 opacity-80 group-hover:opacity-100"
                  onClick={() => setIsHidden(!isHidden)}
                >
                  {isHidden ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <div className="mt-4">
                <Button onClick={() => setActiveTab('verify')} className="w-full">
                  I've noted it down - Verify
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="verify" className="pt-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Type your recovery phrase to verify
                  </label>
                  <Input
                    value={verificationInput}
                    onChange={handleVerifyInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter all 12 words separated by spaces"
                    className={verificationError ? "border-red-500" : ""}
                  />
                  {verificationError && (
                    <p className="text-xs text-red-500 mt-1">
                      The phrase doesn't match. Check for typos and spaces.
                    </p>
                  )}
                </div>
                
                <Button onClick={handleVerify} className="w-full">
                  Verify Phrase
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex items-start space-x-3 pt-2">
            <Checkbox 
              id="confirm" 
              checked={hasAcknowledged}
              onCheckedChange={(checked) => setHasAcknowledged(checked === true)}
              className="mt-1"
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="confirm"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I've securely saved my recovery phrase
              </label>
              <p className="text-xs text-muted-foreground">
                I understand that if I lose my recovery phrase, I will not be able to recover my account
              </p>
            </div>
          </div>
          
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-md p-3 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <strong className="font-medium text-amber-500">Important:</strong> ModSec will never ask for your recovery phrase. Anyone who asks for it is trying to steal your account.
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleContinue}
            disabled={!hasAcknowledged}
          >
            Continue to ModSec
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}