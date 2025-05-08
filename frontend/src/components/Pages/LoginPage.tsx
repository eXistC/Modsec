import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { LockKeyhole, ArrowRightCircle, Check, AlertCircle, AlertTriangle } from "lucide-react";
import { AnimatedCard } from "../ui/animated-card";
import { RecoveryForm } from "../Recovery/RecoveryForm";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onRegisterClick: () => void;
}

export function LoginPage({ onLogin, onRegisterClick }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    
    setIsLoggingIn(true);
    setError(null);
    
    try {
      // Visual delay for animation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Attempt login with proper error handling
      const success = await onLogin(email, password);
      
      if (success) {
        setIsSuccess(true);
        // Animation is handled by the success state
      } else {
        // Login returned false but no exception was thrown
        setIsLoggingIn(false);
        setError("Incorrect email or password");
      }
    } catch (error) {
      setIsLoggingIn(false);
      setIsSuccess(false);
      
      // Extract the error message
      let errorMessage = "Login failed";
      
      if (error instanceof Error) {
        // Parse error message to provide a more user-friendly message
        const message = error.message.toLowerCase();
        
        if (message.includes("status: 500")) {
          errorMessage = "Server error. Please try again later.";
        } else if (message.includes("status: 401") || message.includes("unauthorized")) {
          errorMessage = "Incorrect email or password";
        } else if (message.includes("network") || message.includes("connection")) {
          errorMessage = "Network error. Please check your connection.";
        } else {
          // Use the actual error message if it's descriptive
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    }
  };
  
  // Return the recovery form if in recovery mode
  if (showRecovery) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#1E1E1E] overflow-hidden">
        <div className="w-full max-w-md p-6 bg-card rounded-lg shadow-lg border">
          <RecoveryForm onBack={() => setShowRecovery(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-[#1E1E1E] overflow-hidden">
      <AnimatedCard isSuccess={isSuccess}>
        <CardHeader className="text-center">
          <div className="w-full flex justify-center mb-4">
            <div className={`relative transition-all duration-700 ${isSuccess ? 'scale-150' : ''}`}>
              <LockKeyhole 
                className={`h-12 w-12 transition-all duration-700 ${
                  isSuccess 
                    ? 'text-green-500 scale-0 rotate-180 opacity-0' 
                    : 'text-primary animate-[icon-enter_1000ms_cubic-bezier(0.22, 1, 0.36, 1)_forwards]'
                }`}
              />
              <Check 
                className={`h-12 w-12 text-green-500 absolute inset-0 transition-all duration-700 ${
                  isSuccess 
                    ? 'animate-[check-mark_700ms_cubic-bezier(0.22, 1, 0.36, 1)_forwards]' 
                    : 'opacity-0 scale-0 -rotate-180'
                }`}
              />
            </div>
          </div>
          <CardTitle className="animate-in slide-in-from-bottom-4 duration-500 delay-200">
            Welcome to Modsec
          </CardTitle>
          <CardDescription className="animate-in slide-in-from-bottom-2 duration-500 delay-300">
            Enter your master password to unlock
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive" className="animate-in fade-in-50 duration-300 border-destructive/30 bg-destructive/10">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2 animate-in slide-in-from-bottom-1 duration-700 delay-300">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative group">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    autoFocus
                    disabled={isLoggingIn}
                    className={`
                      transition-all
                      duration-300
                      focus:animate-[input-focus_300ms_cubic-bezier(0.22, 1, 0.36, 1)_forwards]
                      group-hover:border-primary/50
                      ${isSuccess ? 'border-green-500 ring-green-500' : ''}
                      ${error ? 'border-destructive' : ''}
                    `}
                  />
                </div>
              </div>
              <div className="space-y-2 animate-in slide-in-from-bottom-1 duration-700 delay-300">
                <div className="flex justify-between items-center">
                  <Label 
                    htmlFor="masterPassword"
                    className="animate-[subtle-bounce_2s_ease-in-out_infinite]"
                  >
                    Master Password
                  </Label>
                  <Button 
                    type="button" 
                    variant="link" 
                    size="sm" 
                    className="text-xs text-muted-foreground font-normal px-0 h-auto hover:text-primary"
                    onClick={() => setShowRecovery(true)}
                  >
                    Forgot password?
                  </Button>
                </div>
                <div className="relative group">
                  <Input
                    id="masterPassword"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your master password"
                    disabled={isLoggingIn}
                    className={`
                      pr-10
                      transition-all
                      duration-300
                      focus:animate-[input-focus_300ms_cubic-bezier(0.22, 1, 0.36, 1)_forwards]
                      group-hover:border-primary/50
                      ${isSuccess ? 'border-green-500 ring-green-500' : ''}
                      ${error ? 'border-destructive' : ''}
                    `}
                  />
                  <Button 
                    type="submit"
                    size="icon"
                    variant="ghost"
                    disabled={isLoggingIn}
                    className="
                      absolute
                      right-0
                      top-0
                      h-full
                      px-2
                      hover:bg-transparent
                      group
                      transition-all
                      duration-300
                      hover:scale-110
                    "
                  >
                    <ArrowRightCircle className={`
                      h-5
                      w-5
                      transition-all
                      duration-300
                      ${isSuccess 
                        ? 'text-green-500 scale-110 rotate-90' 
                        : 'text-muted-foreground/70 group-hover:text-primary group-hover:translate-x-1'
                      }
                    `} />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center space-y-0 pt-2">
                <Button
                  type="button"
                  variant="link"
                  onClick={onRegisterClick}
                  disabled={isLoggingIn}
                  className="
                    text-sm 
                    text-muted-foreground 
                    hover:text-primary 
                    transition-all 
                    duration-300 
                    hover:scale-105
                  "
                >
                  Don't have an account?
                </Button>
                
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setShowRecovery(true)}
                  disabled={isLoggingIn}
                  className="
                    text-sm 
                    text-muted-foreground 
                    hover:text-primary 
                    transition-all 
                    duration-300 
                    hover:scale-105
                  "
                >
                  Recover account
                </Button>
              </div>
            </div>
          </CardContent>
        </form>
      </AnimatedCard>
    </div>
  );
}
