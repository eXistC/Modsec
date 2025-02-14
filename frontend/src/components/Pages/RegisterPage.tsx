import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { LockKeyhole, ArrowRightCircle, Check, Shield } from "lucide-react";

interface RegisterPageProps {
  onRegister: (masterPassword: string, confirmPassword: string) => void;
  onLoginClick: () => void;
}

export function RegisterPage({ onRegister, onLoginClick }: RegisterPageProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return;
    }
    setIsRegistering(true);

    try {
      // Simulate registration delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsSuccess(true);
      
      // Delay before calling onRegister to show success animation
      setTimeout(() => {
        onRegister(password, confirmPassword);
      }, 800);
    } catch (error) {
      setIsRegistering(false);
    }
  };

  const isPasswordValid = password.length >= 8;
  const doPasswordsMatch = password === confirmPassword && confirmPassword !== "";
  const canSubmit = isPasswordValid && doPasswordsMatch && !isRegistering;

  return (
    <div className="h-screen flex items-center justify-center bg-[#1E1E1E]">
      <Card className={`w-[400px] animate-in fade-in-50 duration-500 zoom-in-95 transition-all ${isSuccess ? 'scale-105 opacity-0' : ''}`}>
        <CardHeader className="text-center">
          <div className="w-full flex justify-center mb-4">
            <div className={`relative transition-all duration-500 ${isSuccess ? 'scale-150' : ''}`}>
              <Shield className={`h-12 w-12 transition-all duration-500 ${
                isSuccess ? 'text-green-500 scale-0' : 'text-primary animate-in spin-in-12 duration-700'
              }`} />
              <Check className={`h-12 w-12 text-green-500 absolute inset-0 transition-all duration-500 ${
                isSuccess ? 'scale-100 rotate-0' : 'scale-0 -rotate-180'
              }`} />
            </div>
          </div>
          <CardTitle className="animate-in slide-in-from-bottom-4 duration-500 delay-200">
            Create Your Account
          </CardTitle>
          <CardDescription className="animate-in slide-in-from-bottom-2 duration-500 delay-300">
            Set up your master password to get started
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
                    placeholder="Create a strong master password"
                    autoFocus
                    disabled={isRegistering}
                    className={`transition-all duration-200 focus:scale-[1.01] ${
                      isSuccess ? 'border-green-500 ring-green-500' : ''
                    }`}
                  />
                </div>
                {password && !isPasswordValid && (
                  <p className="text-xs text-red-500">Password must be at least 8 characters long</p>
                )}
              </div>

              <div className="space-y-2 animate-in slide-in-from-bottom-1 duration-500 delay-500">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your master password"
                    disabled={isRegistering}
                    className={`pr-10 transition-all duration-200 focus:scale-[1.01] ${
                      isSuccess ? 'border-green-500 ring-green-500' : ''
                    }`}
                  />
                  <Button 
                    type="submit" 
                    size="icon"
                    variant="ghost"
                    disabled={!canSubmit}
                    className="absolute right-0 top-0 h-full px-2 hover:bg-transparent group"
                  >
                    <ArrowRightCircle className={`h-5 w-5 transition-all duration-200 ${
                      isSuccess 
                        ? 'text-green-500 scale-110' 
                        : 'text-muted-foreground/70 group-hover:text-primary group-hover:scale-110'
                    }`} />
                  </Button>
                </div>
                {confirmPassword && !doPasswordsMatch && (
                  <p className="text-xs text-red-500">Passwords do not match</p>
                )}
              </div>

              <div className="pt-2 text-center animate-in slide-in-from-bottom-1 duration-500 delay-600">
                <Button
                  type="button"
                  variant="link"
                  onClick={onLoginClick}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Already have an account? Login here
                </Button>
              </div>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}