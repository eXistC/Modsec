import { Input } from "./input";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isEditing?: boolean;
  showPassword?: boolean;
  name?: string; // Added name prop
  onPasswordVisibilityChange?: (show: boolean) => void;
  onPasswordChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordFocus?: () => void;
}

export function PasswordInput({
  value,
  onChange,
  onFocus,
  name, // Added name prop
  isEditing = false,
  showPassword = false,
  className,
  onPasswordVisibilityChange,
  onPasswordChange,
  onPasswordFocus,
  ...props
}: PasswordInputProps) {
  const [internalShowPassword, setInternalShowPassword] = useState(showPassword);
  
  // Use external state if provided, otherwise use internal state
  const actualShowPassword = onPasswordVisibilityChange ? showPassword : internalShowPassword;
  
  const togglePasswordVisibility = () => {
    const newState = !actualShowPassword;
    if (onPasswordVisibilityChange) {
      onPasswordVisibilityChange(newState);
    } else {
      setInternalShowPassword(newState);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) onChange(e);
    if (onPasswordChange) onPasswordChange(e);
  };
  
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (onFocus) onFocus(e);
    if (onPasswordFocus) onPasswordFocus();
  };

  const renderVisibilityToggle = () => {
    if (!isEditing) return null;
    
    return (
      <button
        type="button"
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
        onClick={togglePasswordVisibility}
        tabIndex={-1} // So it doesn't disrupt tab navigation
      >
        {actualShowPassword ? 
          <EyeOff className="h-4 w-4" /> : 
          <Eye className="h-4 w-4" />
        }
      </button>
    );
  };

  return (
    <div className="relative">
      <Input 
        name={name} // Pass the name prop
        type={actualShowPassword ? "text" : "password"}
        className={cn(
          "pr-10",
          `${!isEditing ? 'bg-background' : 'bg-secondary'} border-[1px] border-input`,
          className
        )}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        readOnly={!isEditing}
        {...props}
      />
      {renderVisibilityToggle()}
    </div>
  );
}