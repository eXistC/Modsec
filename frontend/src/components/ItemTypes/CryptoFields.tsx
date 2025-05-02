import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CryptoEntry } from "@/types/password";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface CryptoFieldsProps {
  formData: CryptoEntry;
  isEditing: boolean;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  handleChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  copyToClipboard: (field: string, value: string) => void;
  copiedField: string | null;
}

export function CryptoFields({
  formData,
  isEditing,
  showPassword,
  setShowPassword,
  handleChange,
  copyToClipboard,
  copiedField
}: CryptoFieldsProps) {
  const handleFieldFocus = () => {
    if (isEditing) {
      setShowPassword(true);
    }
  };

  const handlePasswordChange = (field: keyof CryptoEntry) => (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(field as string)(e);
  };

  // Helper component for copyable inputs
  const CopyableInput = ({ 
    label, 
    value, 
    fieldName,
    placeholder = "",
    className = "",
    isPassword = false,
    isTextArea = false
  }: { 
    label: string;
    value: string | undefined;
    fieldName: string;
    placeholder?: string;
    className?: string;
    isPassword?: boolean;
    isTextArea?: boolean;
  }) => {
    if (isTextArea) {
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">{label}</label>
          <div className="relative group">
            <Textarea
              name={fieldName}
              placeholder={placeholder}
              className={`${!isEditing ? 'bg-background' : 'bg-secondary'} 
                ${!isEditing && value ? 'cursor-pointer hover:border-primary/50 transition-colors' : ''}
                border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background font-mono pr-10 min-h-[80px] ${className}`}
              value={value || ''}
              onChange={handleChange(fieldName)}
              style={{ 
                WebkitTextSecurity: (isPassword && (!isEditing || !showPassword)) ? 'disc' : 'none'
              } as React.CSSProperties}
              onFocus={handleFieldFocus}
              onBlur={() => {
                if (isEditing && isPassword) {
                  setShowPassword(false);
                }
              }}
              readOnly={!isEditing}
              onClick={() => !isEditing && value && copyToClipboard(fieldName, value)}
            />
            {!isEditing && value && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="absolute right-10 top-3 
                      text-muted-foreground hover:text-primary transition-colors
                      opacity-0 group-hover:opacity-80 cursor-pointer"
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
            {isPassword && !isEditing && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-[40px] px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground/70" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground/70" />
                )}
              </Button>
            )}
          </div>
        </div>
      );
    }
    
    if (isPassword) {
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">{label}</label>
          <div className="relative group">
            <PasswordInput 
              name={fieldName}
              placeholder={placeholder}
              value={value || ''}
              onChange={handlePasswordChange(fieldName as keyof CryptoEntry)}
              isEditing={isEditing}
              showPassword={showPassword}
              onPasswordVisibilityChange={setShowPassword}
              onPasswordFocus={handleFieldFocus}
              className={`font-mono ${!isEditing && value ? 'cursor-pointer hover:border-primary/50 transition-colors' : ''} ${className}`}
              onClick={() => !isEditing && value && copyToClipboard(fieldName, value)}
            />
            {!isEditing && value && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className={`
                      absolute right-10 top-1/2 transform -translate-y-1/2 
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
    }
    
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <div className="relative group">
          <Input
            name={fieldName}
            placeholder={placeholder}
            className={`
              ${!isEditing ? 'bg-background' : 'bg-secondary'} 
              ${!isEditing && value ? 'cursor-pointer hover:border-primary/50 transition-colors duration-200' : ''}
              border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background pr-10 ${className}
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
  };

  return (
    <>
      <CopyableInput
        label="Wallet Name"
        value={formData.walletName}
        fieldName="walletName"
        placeholder="Enter wallet name"
      />

      <CopyableInput
        label="Wallet Address"
        value={formData.address}
        fieldName="address"
        placeholder="Enter wallet address"
        className="font-mono"
      />

      <CopyableInput
        label="Private Key"
        value={formData.privateKey}
        fieldName="privateKey"
        placeholder="Enter private key"
        isPassword={true}
        className="font-mono"
      />

      <CopyableInput
        label="Notes"
        value={formData.notes}
        fieldName="notes"
        placeholder="Enter notes"
        isTextArea={true}
      />
    </>
  );
}