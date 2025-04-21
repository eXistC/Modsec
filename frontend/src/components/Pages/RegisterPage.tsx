import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { LockKeyhole, ArrowRightCircle, Check, Shield, AlertCircle, Eye, EyeOff, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

  // Enhanced password validation with better weightings
  const hasMinLength = password.length >= 12; // Increased to 12 for better security
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const hasNoCommonPatterns = !/password|123456|qwerty|admin/i.test(password);
  
  // Calculate password strength (0-100) with better algorithm
  const calculatePasswordStrength = () => {
    if (password.length === 0) return 0;
    
    let strength = 0;
    // Base score from length (more chars = higher score)
    strength += Math.min(password.length * 4, 25);
    
    // Character diversity score
    if (hasUpperCase) strength += 15;
    if (hasLowerCase) strength += 10;
    if (hasNumber) strength += 15;
    if (hasSymbol) strength += 20;
    
    // Penalize patterns or common words
    if (!hasNoCommonPatterns) strength -= 20;
    
    // Bonus for having all character types
    if (hasUpperCase && hasLowerCase && hasNumber && hasSymbol) strength += 15;
    
    return Math.min(Math.max(strength, 0), 100);
  };
  
  const passwordStrength = calculatePasswordStrength();
  
  const getStrengthLabel = () => {
    if (password.length === 0) return "";
    if (passwordStrength < 30) return "Very Weak";
    if (passwordStrength < 50) return "Weak";
    if (passwordStrength < 70) return "Moderate";
    if (passwordStrength < 90) return "Strong";
    return "Very Strong";
  };
  
  const getStrengthColor = () => {
    if (password.length === 0) return "bg-gray-200";
    if (passwordStrength < 30) return "bg-red-500";
    if (passwordStrength < 50) return "bg-orange-500";
    if (passwordStrength < 70) return "bg-yellow-500";
    if (passwordStrength < 90) return "bg-green-500";
    return "bg-emerald-500";
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSymbol;
  const doPasswordsMatch = password === confirmPassword && confirmPassword !== "";
  const canSubmit = isEmailValid && isPasswordValid && doPasswordsMatch && !isRegistering;

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
                
                {/* Password strength indicator */}
                {password.length > 0 && (
                  <div className="space-y-3 mt-3 bg-secondary/30 p-3 rounded-md animate-in fade-in-50">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span>Password strength:</span>
                        <span className={`font-medium ${
                          passwordStrength >= 90 ? 'text-emerald-500' : 
                          passwordStrength >= 70 ? 'text-green-500' : 
                          passwordStrength >= 50 ? 'text-yellow-500' : 
                          passwordStrength >= 30 ? 'text-orange-500' : 'text-red-500'
                        }`}>
                          {getStrengthLabel()}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getStrengthColor()} transition-all duration-300 ease-out rounded-full`}
                          style={{ width: `${passwordStrength}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                      <div className={`text-xs flex items-center gap-1.5 transition-colors duration-200 ${hasMinLength ? 'text-green-500' : 'text-muted-foreground'}`}>
                        <Check className={`h-3.5 w-3.5 transition-opacity duration-200 ${hasMinLength ? 'opacity-100' : 'opacity-50'}`} />
                        <span>At least 12 characters</span>
                      </div>
                      <div className={`text-xs flex items-center gap-1.5 transition-colors duration-200 ${hasUpperCase ? 'text-green-500' : 'text-muted-foreground'}`}>
                        <Check className={`h-3.5 w-3.5 transition-opacity duration-200 ${hasUpperCase ? 'opacity-100' : 'opacity-50'}`} />
                        <span>Uppercase letter (A-Z)</span>
                      </div>
                      <div className={`text-xs flex items-center gap-1.5 transition-colors duration-200 ${hasLowerCase ? 'text-green-500' : 'text-muted-foreground'}`}>
                        <Check className={`h-3.5 w-3.5 transition-opacity duration-200 ${hasLowerCase ? 'opacity-100' : 'opacity-50'}`} />
                        <span>Lowercase letter (a-z)</span>
                      </div>
                      <div className={`text-xs flex items-center gap-1.5 transition-colors duration-200 ${hasNumber ? 'text-green-500' : 'text-muted-foreground'}`}>
                        <Check className={`h-3.5 w-3.5 transition-opacity duration-200 ${hasNumber ? 'opacity-100' : 'opacity-50'}`} />
                        <span>Number (0-9)</span>
                      </div>
                      <div className={`text-xs flex items-center gap-1.5 transition-colors duration-200 ${hasSymbol ? 'text-green-500' : 'text-muted-foreground'}`}>
                        <Check className={`h-3.5 w-3.5 transition-opacity duration-200 ${hasSymbol ? 'opacity-100' : 'opacity-50'}`} />
                        <span>Special character (!@#$)</span>
                      </div>
                      <div className={`text-xs flex items-center gap-1.5 transition-colors duration-200 ${hasNoCommonPatterns ? 'text-green-500' : 'text-red-500'}`}>
                        <Check className={`h-3.5 w-3.5 transition-opacity duration-200 ${hasNoCommonPatterns ? 'opacity-100' : 'opacity-50'}`} />
                        <span>No common patterns</span>
                      </div>
                    </div>
                  </div>
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