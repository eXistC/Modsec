import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { LockKeyhole, ArrowRightCircle, Shield, AlertCircle, Eye, EyeOff, Info, Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PasswordStrengthMeter, isPasswordValid } from "@/components/PasswordStrength/PasswordStrengthMeter";

interface RegisterPageProps {
  onRegister: (email: string, masterPassword: string, confirmPassword: string) => void;
  onLoginClick: () => void;
}

export function RegisterPage({ onRegister, onLoginClick }: RegisterPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword || !canSubmit) {
      return;
    }
    setIsRegistering(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsSuccess(true);
      
      setTimeout(() => {
        onRegister(email, password, confirmPassword);
      }, 800);
    } catch (error) {
      setIsRegistering(false);
    }
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const doPasswordsMatch = password === confirmPassword && confirmPassword !== "";
  const canSubmit = isEmailValid && isPasswordValid(password, email) && doPasswordsMatch && !isRegistering;

  return (
    <div className="h-screen flex items-center justify-center bg-[#1E1E1E] p-4">
      <Card className={`w-[450px] max-w-full animate-in fade-in-50 duration-500 zoom-in-95 transition-all shadow-xl ${isSuccess ? 'scale-105 opacity-0' : ''}`}>
        <CardHeader className="text-center pb-6">
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
          <CardTitle className="animate-in slide-in-from-bottom-4 duration-500 delay-200 text-2xl">
            Create Your Account
          </CardTitle>
          <CardDescription className="animate-in slide-in-from-bottom-2 duration-500 delay-300 mt-2">
            Enter your email and create a strong master password.<br/>
            <span className="text-amber-500 font-medium">This password will be used to encrypt your data.</span>
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-5">
              <div className={`space-y-2 animate-in slide-in-from-bottom-1 duration-500 delay-300 transition-all ${focusedField === 'email' ? 'scale-[1.01]' : ''}`}>
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  Email Address
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-80 text-xs">This email will be used to identify your account.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    autoFocus
                    disabled={isRegistering}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className={`transition-all duration-300 ${
                      isSuccess ? 'border-green-500 ring-green-500' : ''
                    }`}
                  />
                </div>
                {email && !isEmailValid && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1 animate-in fade-in-50">
                    <AlertCircle className="h-3 w-3" /> Please enter a valid email address
                  </p>
                )}
              </div>

              <div className={`space-y-2 animate-in slide-in-from-bottom-1 duration-500 delay-400 transition-all ${focusedField === 'password' ? 'scale-[1.01]' : ''}`}>
                <Label htmlFor="masterPassword" className="text-sm font-medium flex items-center gap-2">
                  Master Password
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-80 text-xs">This is your encryption key. Make it strong and don't forget it - we can't recover it if lost.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <div className="relative">
                  <Input
                    id="masterPassword"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong master password"
                    disabled={isRegistering}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className={`pr-10 transition-all duration-300 ${
                      isSuccess ? 'border-green-500 ring-green-500' : ''
                    }`}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                
                {/* Using our new modular PasswordStrengthMeter component */}
                {password.length > 0 && (
                  <PasswordStrengthMeter password={password} email={email} />
                )}
              </div>

              <div className={`space-y-2 animate-in slide-in-from-bottom-1 duration-500 delay-500 transition-all ${focusedField === 'confirmPassword' ? 'scale-[1.01]' : ''}`}>
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your master password"
                    disabled={isRegistering}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    className={`pr-10 transition-all duration-300 ${
                      isSuccess ? 'border-green-500 ring-green-500' : ''
                    }`}
                  />
                  <Button 
                    type="submit" 
                    size="icon"
                    variant="ghost"
                    disabled={!canSubmit}
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent group"
                  >
                    <ArrowRightCircle className={`h-5 w-5 transition-all duration-300 ${
                      isSuccess 
                        ? 'text-green-500 scale-110' 
                        : canSubmit 
                          ? 'text-primary group-hover:scale-110'
                          : 'text-muted-foreground/50'
                    }`} />
                  </Button>
                </div>
                {confirmPassword && !doPasswordsMatch && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1 animate-in fade-in-50">
                    <AlertCircle className="h-3 w-3" /> Passwords do not match
                  </p>
                )}
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col items-center pt-2 pb-6">
            <Button
              type="submit"
              disabled={!canSubmit}
              className={`w-full transition-all duration-300 ${canSubmit ? 'hover:scale-[1.02] active:scale-[0.98]' : ''}`}
              size="lg"
            >
              {isRegistering ? 'Creating account...' : 'Create Account'}
            </Button>
            
            <div className="pt-4 text-center animate-in slide-in-from-bottom-1 duration-500 delay-600">
              <Button
                type="button"
                variant="link"
                onClick={onLoginClick}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Already have an account? Login here
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}