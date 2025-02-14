import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { LockKeyhole, ArrowRightCircle, Check } from "lucide-react";

interface LoginPageProps {
  onLogin: (masterPassword: string) => void;
  onRegisterClick: () => void;  // Add this prop
}

export function LoginPage({ onLogin, onRegisterClick }: LoginPageProps) {
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      // Simulate login delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsSuccess(true);
      
      // Delay before calling onLogin to show success animation
      setTimeout(() => {
        onLogin(password);
      }, 800);
    } catch (error) {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#1E1E1E]">
      <Card className={`w-[400px] animate-in fade-in-50 duration-500 zoom-in-95 transition-all ${isSuccess ? 'scale-105 opacity-0' : ''}`}>
        <CardHeader className="text-center">
          <div className="w-full flex justify-center mb-4">
            <div className={`relative transition-all duration-500 ${isSuccess ? 'scale-150' : ''}`}>
              <LockKeyhole className={`h-12 w-12 transition-all duration-500 ${
                isSuccess ? 'text-green-500 scale-0' : 'text-primary animate-in spin-in-12 duration-700'
              }`} />
              <Check className={`h-12 w-12 text-green-500 absolute inset-0 transition-all duration-500 ${
                isSuccess ? 'scale-100 rotate-0' : 'scale-0 -rotate-180'
              }`} />
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
              <div className="space-y-2 animate-in slide-in-from-bottom-1 duration-500 delay-400">
                <Label htmlFor="masterPassword">Master Password</Label>
                <div className="relative">
                  <Input
                    id="masterPassword"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your master password"
                    autoFocus
                    disabled={isLoggingIn}
                    className={`pr-10 transition-all duration-200 focus:scale-[1.01] ${
                      isSuccess ? 'border-green-500 ring-green-500' : ''
                    }`}
                  />
                  <Button 
                    type="submit" 
                    size="icon"
                    variant="ghost"
                    disabled={isLoggingIn}
                    className="absolute right-0 top-0 h-full px-2 hover:bg-transparent group"
                  >
                    <ArrowRightCircle className={`h-5 w-5 transition-all duration-200 ${
                      isSuccess 
                        ? 'text-green-500 scale-110' 
                        : 'text-muted-foreground/70 group-hover:text-primary group-hover:scale-110'
                    }`} />
                  </Button>
                </div>
              </div>
              <div className="pt-2 text-center animate-in slide-in-from-bottom-1 duration-500 delay-500">
                <Button
                  type="button"
                  variant="link"
                  onClick={onRegisterClick}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Don't have an account? Register here
                </Button>
              </div>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}