import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WebsiteEntry } from "@/types/password";
import { InlinePasswordGenerator } from "../Generators/PasswordGeneratorInline";
import { useState } from "react";
import { PasswordInput } from "@/components/ui/password-input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface WebsiteFieldsProps {
  formData: WebsiteEntry;
  isEditing: boolean;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  handleChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  copyToClipboard: (field: string, value: string) => void;
  copiedField: string | null;
}

export function WebsiteFields({
  formData,
  isEditing,
  showPassword,
  setShowPassword,
  handleChange,
  copyToClipboard,
  copiedField
}: WebsiteFieldsProps) {
  const [showGenerator, setShowGenerator] = useState(false);

  const handlePasswordFocus = () => {
    if (isEditing) {
      setShowPassword(true);
      if (!formData.password) {
        setShowGenerator(true);
      }
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange('password')(e);
    if (e.target.value) {
      setShowGenerator(false);
    }
  };

  const handleGeneratePassword = (generatedPassword: string) => {
    handleChange('password')({ 
      target: { value: generatedPassword } 
    } as React.ChangeEvent<HTMLInputElement>);
    setShowGenerator(false);
  };

  // Helper component for copyable inputs
  const CopyableInput = ({ 
    label, 
    value, 
    fieldName,
    placeholder = "",
    type = "text" 
  }: { 
    label: string;
    value: string | undefined;
    fieldName: string;
    placeholder?: string;
    type?: string;
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <div className="relative group">
        <Input
          name={fieldName} // Added name attribute to maintain focus
          type={type}
          placeholder={placeholder}
          className={`
            ${!isEditing ? 'bg-background' : 'bg-secondary'}
            ${!isEditing && value ? 'cursor-pointer hover:border-primary/50 transition-colors duration-200' : ''}
            border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background pr-10
          `}
          value={value || ''}
          onChange={handleChange(fieldName)}
          readOnly={!isEditing}
          onClick={() => !isEditing && value && copyToClipboard(fieldName, value)}
        />
        {!isEditing && value && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                className={`
                  absolute right-3 top-1/2 transform -translate-y-1/2 
                  text-muted-foreground hover:text-primary transition-all duration-200
                  ${copiedField === fieldName ? 'opacity-100' : 'opacity-0 group-hover:opacity-80'} 
                  cursor-pointer
                `}
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(fieldName, value);
                }}
              >
                {copiedField === fieldName ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-primary text-primary-foreground">
              <p>{copiedField === fieldName ? "Copied!" : "Click to copy"}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );

  return (
    <>
      <CopyableInput
        label="Username"
        value={formData.username}
        fieldName="username"
        placeholder="Enter username"
      />

      <CopyableInput
        label="Email"
        value={formData.email}
        fieldName="email"
        placeholder="Enter email"
        type="email"
      />

      <div className="space-y-2 relative">
        <label className="text-sm font-medium text-muted-foreground">Password</label>
        <div className="relative group">
          <PasswordInput 
            name="password" // Added name attribute to maintain focus
            placeholder="Enter password"
            value={formData.password || ''}
            onChange={handlePasswordChange}
            onFocus={handlePasswordFocus}
            isEditing={isEditing}
            showPassword={showPassword}
            onPasswordVisibilityChange={setShowPassword}
            className={`
              ${!isEditing && formData.password ? 'cursor-pointer hover:border-primary/50 transition-colors' : ''}
            `}
            onClick={() => !isEditing && formData.password && copyToClipboard('password', formData.password)}
          />
          {!isEditing && formData.password && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className={`
                    absolute right-10 top-1/2 transform -translate-y-1/2 
                    text-muted-foreground hover:text-primary transition-all duration-200
                    ${copiedField === 'password' ? 'opacity-100' : 'opacity-0 group-hover:opacity-80'} 
                    cursor-pointer
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard('password', formData.password || "");
                  }}
                >
                  {copiedField === 'password' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-primary text-primary-foreground">
                <p>{copiedField === 'password' ? "Copied!" : "Click to copy"}</p>
              </TooltipContent>
            </Tooltip>
          )}
          {showGenerator && isEditing && (
            <InlinePasswordGenerator 
              onGenerate={handleGeneratePassword}
              onClose={() => setShowGenerator(false)}
            />
          )}
        </div>
      </div>

      {/* URL field with copy functionality */}
      <CopyableInput
        label="URL"
        value={formData.website}
        fieldName="website"
        placeholder="Enter website URL"
      />
    </>
  );
}