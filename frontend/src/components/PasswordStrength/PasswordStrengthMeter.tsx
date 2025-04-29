import React from "react";
import { Check, X } from "lucide-react";

interface PasswordStrengthMeterProps {
  password: string;
  email?: string; // Optional email to check against
  showRequirements?: boolean;
}

export function PasswordStrengthMeter({ 
  password, 
  email = "",
  showRequirements = true 
}: PasswordStrengthMeterProps) {
  // Password validation criteria
  const hasMinLength = password.length >= 12;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const hasNoCommonPatterns = !/password|123456|qwerty|admin/i.test(password);
  
  // Check if password contains email or parts of email
  const containsEmailCheck = () => {
    if (!email || !password) return true; // If no email is provided, skip this check
    
    const emailLower = email.toLowerCase();
    const passwordLower = password.toLowerCase();
    
    // Full email check
    if (passwordLower.includes(emailLower)) return false;
    
    // Check for username part (before @)
    const username = emailLower.split('@')[0];
    if (username.length > 3 && passwordLower.includes(username)) return false;
    
    // Check domain part (after @)
    if (emailLower.includes('@')) {
      const domain = emailLower.split('@')[1];
      // Get domain without TLD (.com, .org, etc)
      const domainName = domain.split('.')[0];
      if (domainName.length > 3 && passwordLower.includes(domainName)) return false;
    }
    
    return true;
  };
  
  const hasNoEmailParts = containsEmailCheck();
  
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
    
    // Penalize if password contains email parts
    if (!hasNoEmailParts) strength -= 25;
    
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

  // Helper to get text color class based on strength
  const getTextColorClass = () => {
    if (password.length === 0) return "";
    if (passwordStrength < 30) return "text-red-500";
    if (passwordStrength < 50) return "text-orange-500";
    if (passwordStrength < 70) return "text-yellow-500";
    if (passwordStrength < 90) return "text-green-500";
    return "text-emerald-500";
  };

  // Return false if validation requirements are not met
  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSymbol && hasNoEmailParts;

  return (
    <div className="space-y-3 mt-3 bg-secondary/30 p-3 rounded-md animate-in fade-in-50">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span>Password strength:</span>
          <span className={`font-medium ${getTextColorClass()}`}>
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
      
      {showRequirements && (
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
          
          {email && (
            <div className={`text-xs flex items-center gap-1.5 transition-colors duration-200 ${hasNoEmailParts ? 'text-green-500' : 'text-red-500'}`}>
              {hasNoEmailParts ? (
                <Check className="h-3.5 w-3.5 opacity-100" />
              ) : (
                <X className="h-3.5 w-3.5 opacity-100" />
              )}
              <span>No parts of your email</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Export a helper function to validate password requirements
export function isPasswordValid(password: string, email: string = ""): boolean {
  // Check if password contains email parts
  const containsEmailCheck = () => {
    if (!email || !password) return true;
    
    const emailLower = email.toLowerCase();
    const passwordLower = password.toLowerCase();
    
    if (passwordLower.includes(emailLower)) return false;
    
    const username = emailLower.split('@')[0];
    if (username.length > 3 && passwordLower.includes(username)) return false;
    
    if (emailLower.includes('@')) {
      const domain = emailLower.split('@')[1];
      const domainName = domain.split('.')[0];
      if (domainName.length > 3 && passwordLower.includes(domainName)) return false;
    }
    
    return true;
  };

  return (
    password.length >= 12 && 
    /[A-Z]/.test(password) && 
    /[a-z]/.test(password) && 
    /[0-9]/.test(password) && 
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) &&
    containsEmailCheck()
  );
}