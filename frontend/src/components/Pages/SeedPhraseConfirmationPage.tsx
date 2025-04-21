import React, { useState } from 'react';
import { Shield, Copy, Check, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';

export function SeedPhraseConfirmationPage() {
  const { seedPhrase, confirmSeedPhrase } = useAuth();
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

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

  const handleContinue = () => {
    if (hasConfirmed) {
      confirmSeedPhrase();
    }
  };

  const words = seedPhrase?.split(' ') || [];

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
          <div className="bg-secondary/40 p-4 rounded-md relative group">
            <div className="grid grid-cols-3 gap-3">
              {words.map((word, index) => (
                <div key={index} className="flex items-center">
                  <span className="text-sm text-muted-foreground mr-1">{index + 1}.</span>
                  <span className="font-mono text-sm">{word}</span>
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
          </div>
          
          <div className="flex items-start space-x-3 pt-2">
            <Checkbox 
              id="confirm" 
              checked={hasConfirmed}
              onCheckedChange={(checked) => setHasConfirmed(checked === true)}
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
            disabled={!hasConfirmed}
          >
            I've Saved My Recovery Phrase
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}