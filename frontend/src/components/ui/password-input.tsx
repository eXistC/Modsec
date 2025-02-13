import { Input } from "./input";
import { Button } from "./button";
import { Eye, EyeOff } from "lucide-react";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isEditing?: boolean;
  showPassword?: boolean;
  onPasswordVisibilityChange?: (show: boolean) => void;
  onPasswordChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordFocus?: () => void;
}

export function PasswordInput({
  value,
  onChange,
  onFocus,
  isEditing = false,
  showPassword = false,
  className,
  onPasswordVisibilityChange,
  onPasswordChange,
  onPasswordFocus,
  ...props
}: PasswordInputProps) {
  // Separate handlers for better organization
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    onPasswordChange?.(e);
  }, [onChange, onPasswordChange]);

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    onFocus?.(e);
    onPasswordFocus?.();
  }, [onFocus, onPasswordFocus]);

  const handleToggleVisibility = useCallback(() => {
    onPasswordVisibilityChange?.(!showPassword);
  }, [showPassword, onPasswordVisibilityChange]);

  // Render the visibility toggle button
  const renderVisibilityToggle = () => {
    if (!isEditing && value) {
      return (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={handleToggleVisibility}
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground/70" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground/70" />
          )}
        </Button>
      );
    }
    return null;
  };

  return (
    <div className="relative">
      <Input 
        type={showPassword ? "text" : "password"}
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