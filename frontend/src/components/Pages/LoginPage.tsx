import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { LockKeyhole, ArrowRightCircle, Check } from "lucide-react";
import { AnimatedCard } from "../ui/animated-card";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface LoginPageProps {
  onRegisterClick: () => void;
}

export function LoginPage({ onRegisterClick }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoggingIn(true);
    
    try {
      await login(email, password);
      
      // Visual success feedback
      setIsSuccess(true);
      
      // Reset the form after successful login (animation will handle transition)
      setTimeout(() => {
        setEmail("");
        setPassword("");
        setIsLoggingIn(false);
      }, 800);
      
    } catch (error) {
      setIsLoggingIn(false);
      setIsSuccess(false);
      
      // Show error toast
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please check your credentials and try again",
      });
    }
  };

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
            Enter your email and master password to unlock
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-4">
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
                    `}
                  />
                </div>
              </div>
              <div className="space-y-2 animate-in slide-in-from-bottom-1 duration-700 delay-300">
                <Label 
                  htmlFor="masterPassword"
                  className="animate-[subtle-bounce_2s_ease-in-out_infinite]"
                >
                  Master Password
                </Label>
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
              <Button
                type="button"
                variant="link"
                onClick={onRegisterClick}
                className="
                  text-sm 
                  text-muted-foreground 
                  hover:text-primary 
                  transition-all 
                  duration-300 
                  hover:scale-105
                "
              >
                Don't have an account? Register here
              </Button>
            </div>
          </CardContent>
        </form>
      </AnimatedCard>
    </div>
  );
}
